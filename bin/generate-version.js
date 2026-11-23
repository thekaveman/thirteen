#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf8"));
const content = `export const VERSION = "${pkg.version}";\n`;
fs.writeFileSync(path.join(__dirname, "..", "src", "app", "version.ts"), content);
