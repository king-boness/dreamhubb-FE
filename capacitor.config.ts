import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.dreamhubb",
  appName: "dreamhubb",
  webDir: "dist/spa",
  server: {
    androidScheme: "https"
  }

};

export default config;
