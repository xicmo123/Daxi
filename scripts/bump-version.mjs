// Single command to move the version everywhere it is written down.
//
// Before this, MARKETING_VERSION/CURRENT_PROJECT_VERSION in the Xcode project
// and versionName/versionCode in build.gradle were edited by hand and had both
// drifted to 1.0 / 1 — which means a rejected or replaced build can't be told
// apart from the shipped one, and crash reports have nothing to group by.
//
//   npm run release:version -- 1.1.0
//   npm run release:version -- 1.1.0 --build 7
//
// The build number defaults to the current iOS CURRENT_PROJECT_VERSION + 1.
// Both platforms are kept on the same pair so a bug report naming "1.1.0 (7)"
// is unambiguous.
import { promises as fs } from "fs";
import path from "path";

const root = process.cwd();
const PBXPROJ = path.join(root, "ios", "App", "App.xcodeproj", "project.pbxproj");
const GRADLE = path.join(root, "android", "app", "build.gradle");
const ENV_FILE = path.join(root, ".env.local");

function parseArgs(argv) {
  const positional = [];
  let build = null;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--build") build = Number(argv[++i]);
    else positional.push(argv[i]);
  }
  return { version: positional[0], build };
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

async function main() {
  const { version, build: explicitBuild } = parseArgs(process.argv.slice(2));

  if (!version) fail("用法：npm run release:version -- <版本號，例如 1.1.0> [--build 7]");
  if (!/^\d+\.\d+(\.\d+)?$/.test(version)) fail(`版本號格式不對：${version}（應為 1.1 或 1.1.0）`);

  let pbxproj = await fs.readFile(PBXPROJ, "utf-8");
  const currentBuild = Number(pbxproj.match(/CURRENT_PROJECT_VERSION = (\d+);/)?.[1] ?? 0);
  const build = explicitBuild ?? currentBuild + 1;
  if (!Number.isInteger(build) || build < 1) fail(`build 號碼不合法：${build}`);

  pbxproj = pbxproj
    .replace(/MARKETING_VERSION = [^;]+;/g, `MARKETING_VERSION = ${version};`)
    .replace(/CURRENT_PROJECT_VERSION = [^;]+;/g, `CURRENT_PROJECT_VERSION = ${build};`);
  await fs.writeFile(PBXPROJ, pbxproj, "utf-8");

  let gradle = await fs.readFile(GRADLE, "utf-8");
  gradle = gradle
    .replace(/versionName "[^"]*"/, `versionName "${version}"`)
    .replace(/versionCode \d+/, `versionCode ${build}`);
  await fs.writeFile(GRADLE, gradle, "utf-8");

  // NEXT_PUBLIC_APP_VERSION is what the 關於 sheet shows and what every client
  // error report is tagged with, so it has to move in the same step.
  const label = `${version} (${build})`;
  let env = "";
  try {
    env = await fs.readFile(ENV_FILE, "utf-8");
  } catch {
    env = "";
  }
  const line = `NEXT_PUBLIC_APP_VERSION=${label}`;
  env = /^NEXT_PUBLIC_APP_VERSION=.*$/m.test(env)
    ? env.replace(/^NEXT_PUBLIC_APP_VERSION=.*$/m, line)
    : `${env.endsWith("\n") || env === "" ? env : env + "\n"}${line}\n`;
  await fs.writeFile(ENV_FILE, env, "utf-8");

  const packageJsonPath = path.join(root, "package.json");
  const pkg = JSON.parse(await fs.readFile(packageJsonPath, "utf-8"));
  pkg.version = version;
  await fs.writeFile(packageJsonPath, JSON.stringify(pkg, null, 2) + "\n", "utf-8");

  console.log(`版本已更新為 ${label}`);
  console.log("  ios/App/App.xcodeproj/project.pbxproj");
  console.log("  android/app/build.gradle");
  console.log("  .env.local (NEXT_PUBLIC_APP_VERSION)");
  console.log("  package.json");
  console.log("\n接著執行：npm run build && npm run cap:sync");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
