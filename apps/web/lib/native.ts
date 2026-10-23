"use client";

/**
 * ความสามารถเฉพาะแอป Android (Capacitor) โหลดแบบ dynamic เพื่อไม่ให้กระทบเว็บ
 */
export function isNative(): boolean {
  return typeof window !== "undefined" && !!(window as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.();
}

export const remindersSupported = isNative;

const REMINDER_ID = 1001;

/** ตั้งแจ้งเตือนทบทวนทุกวันตามชั่วโมงที่เลือก (null = ยกเลิก) คืนข้อความสำหรับแสดงผล */
export async function scheduleReminders(hour: number | null): Promise<string> {
  if (!isNative()) return "";
  const { LocalNotifications } = await import("@capacitor/local-notifications");
  await LocalNotifications.cancel({ notifications: [{ id: REMINDER_ID }] });
  if (hour === null) return "ปิดการแจ้งเตือนแล้ว";
  const perm = await LocalNotifications.requestPermissions();
  if (perm.display !== "granted") return "ยังไม่ได้อนุญาตการแจ้งเตือนในการตั้งค่าเครื่อง";
  await LocalNotifications.schedule({
    notifications: [
      {
        id: REMINDER_ID,
        title: "ถึงเวลาทบทวนแล้ว",
        body: "ทบทวนวันละนิด จำได้นานขึ้น เปิดคลังรู้ดูหัวข้อที่ถึงกำหนด",
        schedule: { on: { hour, minute: 0 }, repeats: true, allowWhileIdle: true },
      },
    ],
  });
  return `จะเตือนทุกวันเวลา ${String(hour).padStart(2, "0")}:00 น.`;
}
