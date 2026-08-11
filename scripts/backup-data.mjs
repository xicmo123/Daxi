// Snapshot data/ to a timestamped archive.
//
// Everything the app owns that is not in git lives in data/: merchant
// passcodes, coupon redemptions, reservation bookings, the community bulletin,
// admin-authored places and carousels. .gitignore deliberately excludes the
// live ones (they hold credentials and customer records), which means git is
// NOT a backup for them — a disk failure or a bad write loses the lot with no
// second copy anywhere.
//
//   npm run backup:data                     → ./backups
//   DAXI_BACKUP_DIR=/Volumes/x npm run backup:data
//
// Keeps the newest DAXI_BACKUP_KEEP (default 30) archives and prunes the rest.
//
// Scheduling on the Mac that serves the app — runs daily at 03:30:
//
//   echo "30 3 * * * cd $PWD && /usr/local/bin/npm run backup:data" | crontab -
//
// IMPORTANT: point DAXI_BACKUP_DIR at a different physical device (external
// disk, NAS, iCloud/Dropbox folder). A backup on the same SSD as the original
// only protects against a bad write, not against the drive dying.
//
// Restore: stop the server, `tar -xzf <archive> -C .`, start it again. The
// archive expands to `data/…` relative to the project root.
import { promises as fs } from "fs";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";

const run = promisify(execFile);

const root = process.cwd();
const dataDir = path.join(root, "data");
const backupDir = path.resolve(root, process.env.DAXI_BACKUP_DIR || "backups");
const keep = Number(process.env.DAXI_BACKUP_KEEP || 30);

/** 2026-08-04T161230 — sorts chronologically as a plain string. */
function stamp() {
  return new Date().toISOString().replace(/\.\d+Z$/, "").replace(/[:]/g, "").replace("T", "T");
}

async function prune() {
  const entries = await fs.readdir(backupDir);
  const archives = entries.filter((name) => /^daxi-data-.*\.tar\.gz$/.test(name)).sort();
  const stale = archives.slice(0, Math.max(0, archives.length - keep));
  for (const name of stale) {
    await fs.rm(path.join(backupDir, name), { force: true });
  }
  return stale.length;
}

async function main() {
  try {
    await fs.access(dataDir);
  } catch {
    console.error(`找不到資料目錄：${dataDir}`);
    process.exit(1);
  }

  await fs.mkdir(backupDir, { recursive: true });

  const name = `daxi-data-${stamp()}.tar.gz`;
  const target = path.join(backupDir, name);

  // -C root so the archive holds `data/...` rather than absolute paths, which
  // makes restoring into a checkout a single tar -xzf.
  await run("tar", ["-czf", target, "-C", root, "data"]);

  const { size } = await fs.stat(target);
  const pruned = await prune();

  console.log(`備份完成：${target} (${(size / 1024).toFixed(1)} KB)`);
  if (pruned > 0) console.log(`已清除 ${pruned} 份過舊備份（保留最新 ${keep} 份）`);
  if (backupDir.startsWith(root)) {
    console.warn("⚠️  備份目錄在專案內，與原始資料同一顆硬碟；請設定 DAXI_BACKUP_DIR 指向外接或雲端目錄。");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
