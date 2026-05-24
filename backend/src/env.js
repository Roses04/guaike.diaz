import dotenv from "dotenv";
import fs from "fs";
import path from "path";

const rootEnvPath = path.resolve(process.cwd(), ".env");
const parentEnvPath = path.resolve(process.cwd(), "..", ".env");
const backendEnvPath = path.resolve(process.cwd(), "backend", ".env");
const envPath = [rootEnvPath, parentEnvPath, backendEnvPath].find((p) => fs.existsSync(p));

if (envPath) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}
