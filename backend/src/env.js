import dotenv from "dotenv";
import fs from "fs";
import path from "path";

const rootEnvPath = path.resolve(process.cwd(), ".env");
const rootEnvLocalPath = path.resolve(process.cwd(), ".env.local");
const parentEnvPath = path.resolve(process.cwd(), "..", ".env");
const parentEnvLocalPath = path.resolve(process.cwd(), "..", ".env.local");
const backendEnvPath = path.resolve(process.cwd(), "backend", ".env");
const backendEnvLocalPath = path.resolve(process.cwd(), "backend", ".env.local");
const envPaths = [rootEnvPath, rootEnvLocalPath, parentEnvPath, parentEnvLocalPath, backendEnvPath, backendEnvLocalPath].filter((p) => fs.existsSync(p));

if (envPaths.length > 0) {
  for (const envPath of envPaths) {
    dotenv.config({ path: envPath });
  }
} else {
  dotenv.config();
}
