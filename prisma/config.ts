import { defineConfig } from "prisma/config";
import * as fs from "fs";
import * as path from "path";

// Load .env.local manually since Prisma CLI doesn't pick it up
function loadEnvLocal() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      let value = trimmed.slice(eqIdx + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  }
}

loadEnvLocal();

const connectionString = process.env.DATABASE_URL!;

export default defineConfig({
  // @ts-expect-error earlyAccess is valid but type not exported
  earlyAccess: true,
  datasource: {
    url: connectionString,
  },
});
