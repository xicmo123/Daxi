import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "net.zequo.daxi",
  appName: "大溪通",
  webDir: "public",
  server: {
    url: "https://daxi.zequo.net",
    cleartext: false,
  },
};

export default config;
