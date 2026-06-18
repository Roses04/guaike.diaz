import { BackupService } from "./BackupService.js";
import fs from "fs";
import path from "path";

export class BackupScheduler {
  private static checkIntervalMs = 60 * 60 * 1000; // Check every 1 hour
  private static lastRunFilePath = path.resolve(process.cwd(), "backups", ".last_scheduled_backup");

  public static init() {
    console.log("[BackupScheduler] Initializing weekly backup scheduler...");
    
    // Run an initial check on startup
    this.checkAndRunBackup();

    // Set up standard periodic interval check
    setInterval(() => {
      this.checkAndRunBackup();
    }, this.checkIntervalMs);
  }

  private static async checkAndRunBackup() {
    try {
      const now = new Date();
      // Check if it is Sunday (Day 0)
      if (now.getDay() !== 0) {
        return;
      }

      // Format date key (YYYY-MM-DD)
      const dateKey = now.toISOString().split("T")[0] || "";

      // Check if we already ran a backup today
      if (fs.existsSync(this.lastRunFilePath)) {
        const lastRun = fs.readFileSync(this.lastRunFilePath, "utf8").trim();
        if (lastRun === dateKey) {
          // Already run today
          return;
        }
      }

      console.log(`[BackupScheduler] Triggering scheduled weekend database backup for: ${dateKey}`);
      const { filename } = await BackupService.createBackup();
      console.log(`[BackupScheduler] Backup created successfully: ${filename}`);

      // Save the date key to prevent double runs
      const backupDir = path.dirname(this.lastRunFilePath);
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
      fs.writeFileSync(this.lastRunFilePath, dateKey, "utf8");
    } catch (error) {
      console.error("[BackupScheduler] Error running scheduled weekend backup:", error);
    }
  }
}
