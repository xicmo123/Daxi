// Builds the tiny asset bundle that ships inside the iOS/Android binary.
//
// capacitor.config.ts used to point webDir at `public/`, which meant all 111
// files and ~12MB of photos were copied into the app bundle — and then never
// loaded, because `server.url` makes the webview fetch everything from
// daxi.zequo.net instead. The only local asset the app actually needs is the
// offline fallback page (`server.errorPath`).
//
// Run automatically by `npm run cap:sync`.
import { promises as fs } from "fs";
import path from "path";

const root = process.cwd();
const shellDir = path.join(root, "capacitor-shell");

// `index.html` is required by Capacitor's own bundle checks even though the
// remote server.url means it is never rendered; it just forwards to the live
// site if anything ever does load it.
const INDEX_HTML = `<!doctype html>
<html lang="zh-Hant">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="refresh" content="0; url=https://daxi.zequo.net/" />
    <title>大溪通</title>
  </head>
  <body></body>
</html>
`;

async function main() {
  await fs.rm(shellDir, { recursive: true, force: true });
  await fs.mkdir(shellDir, { recursive: true });

  await fs.writeFile(path.join(shellDir, "index.html"), INDEX_HTML, "utf-8");
  await fs.copyFile(path.join(root, "public", "offline.html"), path.join(shellDir, "offline.html"));

  const { size } = await fs.stat(path.join(shellDir, "offline.html"));
  console.log(`capacitor-shell ready (offline.html ${(size / 1024).toFixed(1)} KB)`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
