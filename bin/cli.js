#!/usr/bin/env node

// Ensure the script is executable from the CLI
process.title = "book2text";

const { runCli } = require("../book2text");

// Handle unhandled promise rejections
process.on("unhandledRejection", (error) => {
  console.error("Unhandled Promise Rejection:", error);
  process.exit(1);
});

// Execute the CLI
runCli();
