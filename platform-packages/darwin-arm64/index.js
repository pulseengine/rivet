#!/usr/bin/env node

const path = require("path");

// Absolute path to the rivet binary shipped in this platform package.
module.exports = path.join(__dirname, "rivet");
