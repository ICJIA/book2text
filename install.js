#!/usr/bin/env node

const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

console.log("Installing book2text globally...");

// Run npm install -g in the current directory
const install = spawn("npm", ["install", "-g", "."], {
  stdio: "inherit",
  shell: true,
});

install.on("close", (code) => {
  if (code === 0) {
    console.log("\n✅ Installation successful!");
    console.log('You can now run "book2text --help" from anywhere.');
  } else {
    console.error("\n❌ Installation failed with code:", code);
    console.log('Try running "npm install -g ." manually.');
  }
});
