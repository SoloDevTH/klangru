import type { NextConfig } from "next";

// ส่งออกเป็นไฟล์ static ทั้งหมด: ใช้ได้ทั้งโฮสต์เว็บธรรมดาและห่อเป็นแอป Android ด้วย Capacitor (เฟส 2)
const config: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  transpilePackages: ["@klangru/schema"],
};

export default config;
