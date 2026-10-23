"use client";

import { useEffect } from "react";
import { registerServiceWorker } from "@/lib/offline";
import { flushReports } from "@/lib/reports";

/** ลงทะเบียน service worker (เว็บ) และส่งรายงานปัญหาที่ค้างอยู่เมื่อกลับมาออนไลน์ */
export function ServiceWorker() {
  useEffect(() => {
    registerServiceWorker();
    void flushReports();
    const online = () => void flushReports();
    window.addEventListener("online", online);
    return () => window.removeEventListener("online", online);
  }, []);
  return null;
}
