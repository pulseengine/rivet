#!/usr/bin/env node

// Platform detection and binary-path resolution for @pulseengine/rivet.
// Chooses the correct platform-specific optional dependency, or falls back
// to a locally downloaded binary under ./bin (populated by install.js when
// optionalDependencies fail to resolve — e.g., on an unsupported platform
// triplet or with --no-optional).

const os = require("os");
const path = require("path");

/**
 * Map (process.platform, process.arch) to the matching @pulseengine platform
 * package name. Throws for unsupported combinations so the caller can surface
 * a clear error.
 */
function getPlatformPackageName() {
  const platform = os.platform();
  const arch = os.arch();

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
