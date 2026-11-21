#!/usr/bin/env node

// Platform detection and binary-path resolution for @pulseengine/rivet.
// Chooses the correct platform-specific optional dependency, or falls back
// to a locally downloaded binary under ./bin (populated by install.js when
// optionalDependencies fail to resolve — e.g., on an unsupported platform
// triplet or with --no-optional).

const os = require("os");
const path = require("path");

// Intel macOS has no build from v0.43.3 on (owner decision, 2026-11-20).
const UNSUPPORTED_MESSAGE =
  "unsupported platform: darwin-x64. rivet ships no x86_64-apple-darwin " +
  "(Intel macOS) build from v0.43.3 on. On an Apple Silicon Mac running an " +
  "x64 Node under Rosetta 2, use an arm64 Node and the darwin-arm64 build. " +
  "On an Intel Mac, build from source: cargo install --locked --git " +
  `https://github.com/pulseengine/rivet --tag v${require("./package.json").version} rivet-cli`

/**
 * Throws the unsupported-platform error for platforms rivet ships no build for.
 */
function assertSupported(platform = os.platform(), arch = os.arch()) {
  if (platform === "darwin" && arch === "x64") {
    throw new Error(UNSUPPORTED_MESSAGE);
  }
}

/**
 * Map (process.platform, process.arch) to the matching @pulseengine platform
 * package name. Throws for unsupported combinations so the caller can surface
 * a clear error.
 */
function getPlatformPackageName() {
  const platform = os.platform();
  const arch = os.arch();
  assertSupported(platform, arch);

  let platformName;
  switch (platform) {
    case "darwin":
      platformName = "darwin";
      break;
    case "linux":
      platformName = "linux";
      break;
    case "win32":
      platformName = "win32";
      break;
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }

  let archName;
  switch (arch) {
    case "x64":
      archName = "x64";
      break;
    case "arm64":
      archName = "arm64";
      break;
    default:
      throw new Error(`Unsupported architecture: ${arch}`);
  }

  return `@pulseengine/rivet-${platformName}-${archName}`;
}

/**
 * Resolve the absolute path to the rivet binary for the current platform.
 * Prefers the optional-dependency platform package; falls back to ./bin
 * (populated by install.js downloading from the GitHub Release).
 */
function getBinaryPath() {
  const platform = os.platform();
  const binaryName = platform === "win32" ? "rivet.exe" : "rivet";
  assertSupported();

  try {
    const platformPackage = getPlatformPackageName();
    const platformPackagePath = require.resolve(`${platformPackage}/package.json`);
    const platformPackageDir = path.dirname(platformPackagePath);
    return path.join(platformPackageDir, binaryName);
  } catch (_err) {
    // Fallback: binary downloaded directly from GitHub release by install.js.
    return path.join(__dirname, "bin", binaryName);
  }
}

function getPlatformInfo() {
  return {
    platform: os.platform(),
    arch: os.arch(),
    platformPackage: getPlatformPackageName(),
    binaryPath: getBinaryPath(),
    binaryName: os.platform() === "win32" ? "rivet.exe" : "rivet",
  };
}

module.exports = {
  assertSupported,
  getPlatformPackageName,
  getBinaryPath,
  getPlatformInfo,
};

// When invoked directly, print platform info (useful for debugging installs).
if (require.main === module) {
  try {
    const info = getPlatformInfo();
    console.log("Platform Information:");
    console.log(`  Platform:         ${info.platform}`);
    console.log(`  Architecture:     ${info.arch}`);
    console.log(`  Platform Package: ${info.platformPackage}`);
    console.log(`  Binary Name:      ${info.binaryName}`);
    console.log(`  Binary Path:      ${info.binaryPath}`);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}
