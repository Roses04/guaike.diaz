import { Router } from "express";
import type { Response } from "express";
import { BackupService } from "../services/BackupService.js";
import { authenticateToken, authorizeRole, type AuthRequest } from "../middleware/auth.js";
import fs from "fs";

const router = Router();

// Apply admin protection to all routes in this router
router.use(authenticateToken);
router.use(authorizeRole(["admin"]));

/**
 * POST /api/admin/database/backup
 * Triggers a manual database backup.
 */
router.post("/database/backup", async (req: AuthRequest, res: Response) => {
  try {
    const { filename } = await BackupService.createBackup();
    res.status(201).json({
      message: "Copia de seguridad creada correctamente.",
      filename
    });
  } catch (error: any) {
    console.error("Error creating backup:", error);
    res.status(500).json({ message: error.message || "Error al crear la copia de seguridad." });
  }
});

/**
 * GET /api/admin/database/backups
 * Lists all available local backup files.
 */
router.get("/database/backups", async (req: AuthRequest, res: Response) => {
  try {
    const backups = await BackupService.listBackups();
    res.json(backups);
  } catch (error: any) {
    console.error("Error listing backups:", error);
    res.status(500).json({ message: error.message || "Error al listar las copias de seguridad." });
  }
});

/**
 * GET /api/admin/database/backups/download/:filename
 * Downloads a specific backup file.
 */
router.get("/database/backups/download/:filename", async (req: AuthRequest, res: Response) => {
  const filename = String(req.params.filename);
  try {
    const filePath = BackupService.getBackupFilePath(filename);
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ message: "El archivo de copia de seguridad no existe." });
      return;
    }
    res.download(filePath, filename);
  } catch (error: any) {
    console.error("Error downloading backup:", error);
    res.status(500).json({ message: error.message || "Error al descargar la copia de seguridad." });
  }
});

/**
 * POST /api/admin/database/restore
 * Restores the database from a backup file or a uploaded JSON body.
 */
router.post("/database/restore", async (req: AuthRequest, res: Response) => {
  const { filename, data } = req.body;

  try {
    let backupData = data;

    // If a filename is specified, read the local file
    if (filename) {
      const filePath = BackupService.getBackupFilePath(filename);
      if (!fs.existsSync(filePath)) {
        res.status(404).json({ message: "El archivo de copia de seguridad no existe." });
        return;
      }
      const fileContent = fs.readFileSync(filePath, "utf8");
      backupData = JSON.parse(fileContent);
    }

    if (!backupData || !backupData.tables) {
      res.status(400).json({ message: "Datos de copia de seguridad inválidos o vacíos." });
      return;
    }

    console.log(`[Admin Backup] Restoring database trigger by admin user ID: ${req.user?.id}`);
    await BackupService.restoreBackup(backupData);

    res.json({ message: "Base de datos restaurada al 100% exitosamente." });
  } catch (error: any) {
    console.error("Error restoring database:", error);
    res.status(500).json({ message: error.message || "Error al restaurar la copia de seguridad." });
  }
});

export default router;
