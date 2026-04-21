#!/usr/bin/env node

// Post-install hook for @pulseengine/rivet.
//
// Preferred path: the platform-specific optional dependency
// (@pulseengine/rivet-<platform>-<arch>) is already resolved and ships its
// own pre-built binary — nothing to do.
//
// Fallback path: optionalDependencies were skipped (e.g., --no-optional,
// unusual platform triplet, or npm bug) — download the matching archive
// from the GitHub Release and extract the binary into ./bin so run.js can
// find it.

const os = require("os");
const path = require("path");
const fs = require("fs");
const https = require("https");
const { execFileSync } = require("child_process");

const { getPlatformPackageName } = require("./index.js");

// Fast path: platform package resolved => nothing to do.
try {
  const platformPackage = getPlatformPackageName();
  try {
    require.resolve(`${platformPackage}/package.json`);
    console.log(`Platform package ${platformPackage} is available, skipping binary download.`);
    process.exit(0);
  } catch (_err) {
    console.log(
      `Platform package ${platformPackage} not found, falling back to GitHub release download.`,
    );
  }
} catch (_err) {
  console.log(
    "Platform not supported by platform packages, attempting GitHub release download.",
  );
}

// --- Fallback: download from GitHub release ---------------------------------

function getRustTarget() {
  const type = os.type();
  const arch = os.arch();

  let platform;
  if (type === "Windows_NT") platform = "pc-windows-msvc";
  else if (type === "Linux") platform = "unknown-linux-gnu";
  else if (type === "Darwin") platform = "apple-darwin";
  else throw new Error(`Unsupported OS: ${type}`);

  let archSuffix;
  if (arch === "x64") archSuffix = "x86_64";
  else if (arch === "arm64") archSuffix = "aarch64";
  else throw new Error(`Unsupported architecture: ${arch}`);

  return `${archSuffix}-${platform}`;
}

function getBinaryName() {
  return os.type() === "Windows_NT" ? "rivet.exe" : "rivet";
}

function getDownloadUrl() {
  const version = require("./package.json").version;
  const target = getRustTarget();
  const ext = os.type() === "Windows_NT" ? "zip" : "tar.gz";
  // release.yml uploads archives named: rivet-v<version>-<target>.<ext>
  return `https://github.com/pulseengine/rivet/releases/download/v${version}/rivet-v${version}-${target}.${ext}`;
}

function downloadFile(url, destination) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destination);

    https
      .get(url, (response) => {
        if (response.statusCode === 301 || response.statusCode === 302) {
          file.close();
          fs.unlink(destination, () => {});
          return downloadFile(response.headers.location, destination)
            .then(resolve)
            .catch(reject);
        }
        if (response.statusCode !== 200) {
          file.close();
          fs.unlink(destination, () => {});
          return reject(
            new Error(`HTTP ${response.statusCode}: ${response.statusMessage} (${url})`),
          );
        }

        response.pipe(file);
        file.on("finish", () => {
          file.close();
          resolve();
        });
        file.on("error", (err) => {
          fs.unlink(destination, () => {});
          reject(err);
        });
      })
      .on("error", (err) => {
        fs.unlink(destination, () => {});
        reject(err);
      });
  });
}

// Extract via execFile (no shell) to avoid any injection surface. Inputs are
// already hardcoded paths we just constructed, but the argv form is the
// correct idiom regardless.
function extractArchive(archivePath, destDir) {
  if (os.type() === "Windows_NT") {
    execFileSync(
      "powershell",
      [
        "-NoProfile",
        "-Command",
        `Expand-Archive -Path '${archivePath}' -DestinationPath '${destDir}' -Force`,
      ],
      { stdio: "inherit" },
    );
  } else {
    execFileSync("tar", ["-xzf", archivePath, "-C", destDir], { stdio: "inherit" });
  }
}

async function installBinary() {
  const binaryName = getBinaryName();
  const url = getDownloadUrl();
  const target = getRustTarget();

  console.log(`Platform: ${os.type()} ${os.arch()}`);
  console.log(`Target:   ${target}`);
  console.log(`Binary:   ${binaryName}`);
  console.log(`URL:      ${url}`);

  const binDir = path.join(__dirname, "bin");
  if (!fs.existsSync(binDir)) fs.mkdirSync(binDir, { recursive: true });

  const ext = os.type() === "Windows_NT" ? "zip" : "tar.gz";
  const archivePath = path.join(binDir, `rivet.${ext}`);

  console.log("Downloading binary...");
  await downloadFile(url, archivePath);

  console.log("Extracting...");
  extractArchive(archivePath, binDir);

  fs.unlinkSync(archivePath);

  if (os.type() !== "Windows_NT") {
    const binaryPath = path.join(binDir, binaryName);
    if (fs.existsSync(binaryPath)) fs.chmodSync(binaryPath, 0o755);
  }

  console.log("rivet binary installed.");
}

installBinary().catch((err) => {
  console.error("Failed to install rivet binary:", err.message);
  console.error("");
  console.error("You can:");
  console.error("  1. Install from source:");
  console.error(
    "     cargo install --git https://github.com/pulseengine/rivet.git rivet-cli",
  );
  console.error("  2. Download a release manually:");
  console.error("     https://github.com/pulseengine/rivet/releases");
  // Do not fail the install: optionalDependencies are the primary path and a
  // hard failure here would make `npm install` fail on platforms where the
  // platform package was actually resolved (npm runs postinstall regardless).
  process.exit(0);
});
