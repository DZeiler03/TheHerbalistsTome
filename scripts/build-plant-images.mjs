#!/usr/bin/env node
/**
 * Decode public/images/plants-b64/{id}.json → public/images/plants/{id}.png
 * Report coverage against public/data/plants/ids.json
 *
 * Usage: node scripts/build-plant-images.mjs [--strict]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const strict = process.argv.includes("--strict");

const idsPath = path.join(root, "public/data/plants/ids.json");
const b64Dir = path.join(root, "public/images/plants-b64");
const outDir = path.join(root, "public/images/plants");

const green = (s) => `\x1b[32m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;

function main() {
  if (!fs.existsSync(idsPath)) {
    console.error(red("Missing public/data/plants/ids.json"));
    process.exit(1);
  }
  const ids = JSON.parse(fs.readFileSync(idsPath, "utf8"));
  if (!Array.isArray(ids)) {
    console.error(red("ids.json must be an array"));
    process.exit(1);
  }

  fs.mkdirSync(outDir, { recursive: true });
  fs.mkdirSync(b64Dir, { recursive: true });

  let withImage = 0;
  const missing = [];
  const written = [];

  for (const id of ids) {
    const b64Path = path.join(b64Dir, `${id}.json`);
    const outPath = path.join(outDir, `${id}.png`);
    if (!fs.existsSync(b64Path)) {
      // Keep existing PNG if present (local procedural / legacy)
      if (fs.existsSync(outPath) && fs.statSync(outPath).size > 0) {
        withImage++;
        continue;
      }
      missing.push(id);
      continue;
    }
    try {
      const raw = JSON.parse(fs.readFileSync(b64Path, "utf8"));
      const b64 = typeof raw.png === "string" ? raw.png : null;
      if (!b64) {
        missing.push(id);
        continue;
      }
      const buf = Buffer.from(b64, "base64");
      fs.writeFileSync(outPath, buf);
      written.push(id);
      withImage++;
    } catch (e) {
      console.error(red(`Failed ${id}: ${e}`));
      missing.push(id);
    }
  }

  console.log("");
  console.log("═══ Plant portrait pipeline ═══");
  console.log(`Total plants:     ${ids.length}`);
  console.log(`With portrait:    ${green(String(withImage))}`);
  console.log(`Decoded from b64: ${written.length}`);
  console.log(`Missing:          ${missing.length ? yellow(String(missing.length)) : green("0")}`);
  if (missing.length) {
    console.log(yellow("⚠️  Plants without portraits:"));
    for (const id of missing) console.log(yellow(`   - ${id}`));
  } else {
    console.log(green("✅ Every plant has a portrait."));
  }
  console.log("");

  if (strict && missing.length) {
    process.exit(1);
  }

// Decode continent maps: public/images/maps-b64/{id}.json → maps/{id}.png
const mapsB64Dir = path.join(root, "public/images/maps-b64");
const mapsOutDir = path.join(root, "public/images/maps");
if (fs.existsSync(mapsB64Dir)) {
  fs.mkdirSync(mapsOutDir, { recursive: true });
  let mapCount = 0;
  for (const file of fs.readdirSync(mapsB64Dir)) {
    if (!file.endsWith(".json")) continue;
    try {
      const raw = JSON.parse(fs.readFileSync(path.join(mapsB64Dir, file), "utf8"));
      if (typeof raw.png === "string") {
        fs.writeFileSync(path.join(mapsOutDir, `${raw.id || file.replace(/\.json$/, "")}.png`), Buffer.from(raw.png, "base64"));
        mapCount++;
      }
    } catch (e) {
      console.error("map decode failed", file, e);
    }
  }
  console.log(`Continent maps decoded: ${mapCount}`);
}
}

main();
