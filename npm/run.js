#!/usr/bin/env node

// Thin wrapper that spawns the rivet binary resolved via ./index.js.
// Forwards argv, stdio, and exit code; propagates signals to the child.

const { spawn } = require("child_process");
const fs = require("fs");
const { getBinaryPath } = require("./index.js");

function runRivet() {
  let binaryPath;
  try {
    binaryPath = getBinaryPath();
  } catch (err) {
    console.error("Error resolving rivet binary:", err.message);
    console.error("");
    console.error("Your platform may not be supported. Supported targets:");
    console.error("  - darwin-arm64, darwin-x64");
    console.error("  - linux-arm64, linux-x64");
    console.error("  - win32-x64");
    console.error("");
    console.error(
      "Install from source: cargo install --git https://github.com/pulseengine/rivet.git rivet-cli",
    );
    process.exit(1);
  }

  if (!fs.existsSync(binaryPath)) {
    console.error("rivet binary not found at:", binaryPath);
    console.error("");
    console.error("This usually means:");
    console.error("  1. optionalDependencies failed to install for your platform");
    console.error("  2. The GitHub release fallback download failed");
    console.error("  3. Your platform is not supported");
    console.error("");
    console.error("Try: npm install --force @pulseengine/rivet");
    console.error(
      "Or install from source: cargo install --git https://github.com/pulseengine/rivet.git rivet-cli",
    );
    process.exit(1);
  }

  const child = spawn(binaryPath, process.argv.slice(2), {
    stdio: "inherit",
    env: process.env,
  });

  child.on("error", (err) => {
    console.error("Failed to start rivet:", err.message);
    process.exit(1);
  });

  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
    } else {
      process.exit(code == null ? 0 : code);
    }
  });

  process.on("SIGINT", () => child.kill("SIGINT"));
  process.on("SIGTERM", () => child.kill("SIGTERM"));
}

runRivet();
