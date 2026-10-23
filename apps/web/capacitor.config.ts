import type { CapacitorConfig } from "@capacitor/cli";

// แอป Android ห่อไฟล์ static ชุดเดียวกับเว็บ (apps/web/out) จึงเปิดได้แม้ไม่มีอินเทอร์เน็ต
const config: CapacitorConfig = {
  appId: "org.klangru.app",
  appName: "คลังรู้",
  webDir: "out",
  android: {
    // ให้ WebView ใช้ https://localhost เพื่อให้ localStorage และ service worker ทำงานแบบเว็บปกติ
    allowMixedContent: false,
  },
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_klangru",
      iconColor: "#0a6b60",
    },
  },
};

export default config;
