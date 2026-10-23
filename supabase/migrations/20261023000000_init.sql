-- คลังรู้: ฐานข้อมูลความคืบหน้าของผู้เรียน (Supabase / Postgres)
-- หลักการ: เก็บข้อมูลเท่าที่จำเป็น, ทุกตารางเปิด Row Level Security, ผู้เรียนเห็นเฉพาะข้อมูลของตัวเอง
-- สถิติที่เปิดเผยต่อสาธารณะเป็นค่ารวมเท่านั้น และซ่อนโจทย์ที่มีผู้ทำน้อยกว่า 5 คน

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (char_length(display_name) <= 60),
  -- ช่วงอายุ ใช้ตัดสินว่าต้องมีความยินยอมจากผู้ปกครองหรือไม่ (PDPA) ไม่เก็บวันเกิด
  age_band text check (age_band in ('under10', '10to19', '20plus')),
  guardian_consent boolean not null default false,
  settings jsonb not null default '{}'::jsonb,
  settings_updated_at timestamptz not null default 'epoch',
  created_at timestamptz not null default now()
);

create table public.topic_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  topic_id text not null,
  level smallint not null check (level between 0 and 3),
  card jsonb,
  sessions integer not null default 0 check (sessions >= 0),
  last_session timestamptz,
  p_known real check (p_known between 0 and 1),
  placed boolean not null default false,
  -- ครั้งแรกที่ถึงระดับ "ชำนาญ" ใช้วัดผลการทดลอง A/B
  proficient_at timestamptz,
  updated_at timestamptz not null,
  primary key (user_id, topic_id)
);

create table public.attempts (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  problem_id text not null,
  topic_id text not null,
  correct boolean not null,
  hints smallint not null default 0 check (hints >= 0),
  ms integer check (ms >= 0),
  mode text not null check (mode in ('practice', 'review', 'placement')),
  variant text not null check (variant in ('adaptive', 'fixed')),
  at timestamptz not null
);
create index attempts_user_at on public.attempts (user_id, at);
create index attempts_problem on public.attempts (problem_id);

create table public.flashcard_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  card_key text not null,
  card jsonb not null,
  updated_at timestamptz not null,
  primary key (user_id, card_key)
);

create table public.notes (
  user_id uuid not null references auth.users (id) on delete cascade,
  topic_id text not null,
  body text not null check (char_length(body) <= 20000),
  updated_at timestamptz not null,
  primary key (user_id, topic_id)
);

-- ผู้ตรวจเนื้อหา (ครู/ผู้เชี่ยวชาญ) เพิ่มรายชื่อด้วย service role หรือ SQL editor เท่านั้น
create table public.staff (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'reviewer' check (role in ('reviewer', 'admin')),
  created_at timestamptz not null default now()
);

create table public.problem_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  problem_id text not null,
  reason text not null check (reason in ('wrong-answer', 'unclear', 'typo', 'too-hard', 'other')),
  message text check (char_length(message) <= 2000),
  status text not null default 'open' check (status in ('open', 'fixed', 'rejected')),
  created_at timestamptz not null default now()
);

-- บทสนทนากับ AI tutor: บันทึกโดย edge function (service role) เท่านั้น เพื่อให้สุ่มตรวจคุณภาพได้
create table public.tutor_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  conversation_id uuid not null,
  topic_id text not null,
  problem_id text,
  mode text not null check (mode in ('hint', 'example', 'explain', 'chat')),
  role text not null check (role in ('user', 'assistant')),
  content text not null check (char_length(content) <= 8000),
  model text,
  review_status text not null default 'unreviewed' check (review_status in ('unreviewed', 'ok', 'gave-answer', 'wrong', 'off-topic', 'unsafe')),
  created_at timestamptz not null default now()
);
create index tutor_messages_user_day on public.tutor_messages (user_id, created_at);

create function public.is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.staff where user_id = auth.uid())
$$;

-- ---------------- Row Level Security ----------------
alter table public.profiles enable row level security;
alter table public.topic_progress enable row level security;
alter table public.attempts enable row level security;
alter table public.flashcard_progress enable row level security;
alter table public.notes enable row level security;
alter table public.staff enable row level security;
alter table public.problem_reports enable row level security;
alter table public.tutor_messages enable row level security;

create policy "own profile" on public.profiles for all to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
create policy "own progress" on public.topic_progress for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own flashcards" on public.flashcard_progress for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own notes" on public.notes for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
-- attempts เพิ่มและอ่านได้ ลบได้ (ลบข้อมูลตัวเอง) แต่แก้ไขไม่ได้
create policy "read own attempts" on public.attempts for select to authenticated using (user_id = auth.uid());
create policy "add own attempts" on public.attempts for insert to authenticated with check (user_id = auth.uid());
create policy "delete own attempts" on public.attempts for delete to authenticated using (user_id = auth.uid());

create policy "staff can read staff" on public.staff for select to authenticated using (public.is_staff());

-- รายงานปัญหาโจทย์: ใครก็ส่งได้ (ไม่เข้าสู่ระบบก็ได้) เห็นเฉพาะของตัวเอง ผู้ตรวจเห็นและเปลี่ยนสถานะได้ทั้งหมด
create policy "anyone can report" on public.problem_reports for insert to anon, authenticated
  with check (user_id is null or user_id = auth.uid());
create policy "read own reports" on public.problem_reports for select to authenticated
  using (user_id = auth.uid() or public.is_staff());
create policy "staff triage reports" on public.problem_reports for update to authenticated
  using (public.is_staff()) with check (public.is_staff());

create policy "read own tutor messages" on public.tutor_messages for select to authenticated
  using (user_id = auth.uid() or public.is_staff());
create policy "staff review tutor messages" on public.tutor_messages for update to authenticated
  using (public.is_staff()) with check (public.is_staff());

grant select, insert, update, delete on public.profiles, public.topic_progress, public.flashcard_progress, public.notes to authenticated;
grant select, insert, delete on public.attempts to authenticated;
grant select on public.staff to authenticated;
grant insert on public.problem_reports to anon, authenticated;
grant select, update on public.problem_reports, public.tutor_messages to authenticated;

-- ---------------- ฟังก์ชันสถิติ (ค่ารวม ไม่ระบุตัวบุคคล) ----------------

-- สถิติรายข้อ สำหรับแดชบอร์ดคุณภาพและการปรับความยาก (IRT) แสดงเฉพาะข้อที่มีผู้ทำอย่างน้อย 5 คน
create function public.problem_stats()
returns table (problem_id text, topic_id text, attempts bigint, learners bigint, first_try_rate real, avg_hints real)
language sql stable security definer set search_path = public as $$
  select a.problem_id, min(a.topic_id), count(*), count(distinct a.user_id),
         avg(a.correct::int)::real, avg(a.hints)::real
  from public.attempts a
  where a.mode in ('practice', 'review')
  group by a.problem_id
  having count(distinct a.user_id) >= 5
$$;

-- ผลการทดลอง A/B: จำนวนข้อและเวลาที่ใช้ก่อนถึงระดับ "ชำนาญ" แยกตามกลุ่ม
create function public.experiment_summary()
returns table (variant text, learners bigint, topics_reached bigint, median_attempts_to_proficient real, median_minutes_to_proficient real)
language sql stable security definer set search_path = public as $$
  with reached as (
    select tp.user_id, tp.topic_id, tp.proficient_at,
           (select a.variant from public.attempts a where a.user_id = tp.user_id and a.topic_id = tp.topic_id order by a.at limit 1) as variant,
           (select count(*) from public.attempts a where a.user_id = tp.user_id and a.topic_id = tp.topic_id and a.mode = 'practice' and a.at <= tp.proficient_at) as n,
           (select coalesce(sum(a.ms), 0) from public.attempts a where a.user_id = tp.user_id and a.topic_id = tp.topic_id and a.mode = 'practice' and a.at <= tp.proficient_at) as ms
    from public.topic_progress tp
    where tp.proficient_at is not null and not tp.placed
  )
  select r.variant, count(distinct r.user_id), count(*),
         (percentile_cont(0.5) within group (order by r.n))::real,
         (percentile_cont(0.5) within group (order by r.ms / 60000.0))::real
  from reached r
  where r.variant is not null
  group by r.variant
  having count(distinct r.user_id) >= 5
$$;

-- ลบข้อมูลการเรียนทั้งหมดของตัวเอง (บัญชีลบผ่าน edge function delete-account)
create function public.delete_my_data() returns void
language sql security invoker set search_path = public as $$
  delete from public.attempts where user_id = auth.uid();
  delete from public.topic_progress where user_id = auth.uid();
  delete from public.flashcard_progress where user_id = auth.uid();
  delete from public.notes where user_id = auth.uid();
$$;

revoke execute on function public.problem_stats(), public.experiment_summary() from public;
grant execute on function public.problem_stats(), public.experiment_summary() to anon, authenticated;
grant execute on function public.delete_my_data(), public.is_staff() to authenticated;
