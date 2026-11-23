#!/usr/bin/env node
import fs from "fs";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, "..", "dist");

const cssPath = path.join(distDir, "style.css");
if (!fs.existsSync(cssPath)) {
  console.error("style.css not found in dist/");
  process.exit(1);
}

const content = fs.readFileSync(cssPath);
const hash = crypto.createHash("md5").update(content).digest("hex").slice(0, 8);
const hashedName = `style_${hash}.css`;
const hashedPath = path.join(distDir, hashedName);

fs.renameSync(cssPath, hashedPath);
console.log(`Renamed style.css -> ${hashedName}`);
