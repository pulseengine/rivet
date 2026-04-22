#!/usr/bin/env node

// Pre-uninstall hook: remove binaries downloaded into ./bin by install.js.
// Platform packages (optional deps) clean themselves up via normal npm
// lifecycle — no action needed for those.

const fs = require("fs");
const path = require("path");

const binDir = path.join(__dirname, "bin");

if (fs.existsSync(binDir)) {
  try {
    fs.rmSync(binDir, { recursive: true, force: true });
  } catch (err) {
    console.error("Failed to clean rivet bin/:", err.message);
  }
}
