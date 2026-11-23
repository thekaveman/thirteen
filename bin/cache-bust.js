#!/usr/bin/env node
import fs from "fs";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, "..", "dist");
const htmlFile = path.join(distDir, "index.html");
const helpFile = path.join(distDir, "help.html");

// Find the hashed CSS file in dist
const cssFiles = fs.readdirSync(distDir).filter((f) => f.startsWith("style_") && f.endsWith(".css"));
if (cssFiles.length === 0) {
  console.error("No hashed CSS file found in dist/");
  process.exit(1);
}
const hashedCss = cssFiles[0];

// Update HTML references
const updateHtml = (file) => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, "utf8");
  content = content.replace(/href="(style\.css)"/g, `href="${hashedCss}"`);
  fs.writeFileSync(file, content);
  console.log(`Updated ${path.basename(file)} -> ${hashedCss}`);
};

updateHtml(htmlFile);
updateHtml(helpFile);
console.log(`Cache busting: ${hashedCss}`);
