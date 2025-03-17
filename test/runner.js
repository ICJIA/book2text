#!/usr/bin/env node

const { runTests: runConversionTests } = require("./conversion.test");
const readline = require("readline");

// ANSI color codes
const colors = {
  reset: "\x1b[0m",
  black: "\x1b[30m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  brightBlack: "\x1b[90m",
  brightRed: "\x1b[91m",
  brightGreen: "\x1b[92m",
  brightYellow: "\x1b[93m",
  brightBlue: "\x1b[94m",
  brightMagenta: "\x1b[95m",
  brightCyan: "\x1b[96m",
  brightWhite: "\x1b[97m",
  // Background
  bgBlack: "\x1b[40m",
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
  bgMagenta: "\x1b[45m",
  bgCyan: "\x1b[46m",
  bgWhite: "\x1b[47m",
  // Text formatting
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  italic: "\x1b[3m",
  underline: "\x1b[4m",
};

// Spinner frames
const spinnerFrames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

// Show spinner while tests are running
function runSpinner(text) {
  let frameIndex = 0;
  const spinner = setInterval(() => {
    const frame = spinnerFrames[frameIndex];
    process.stdout.write(`\r${colors.cyan}${frame}${colors.reset} ${text}`);
    frameIndex = (frameIndex + 1) % spinnerFrames.length;
  }, 80);

  return {
    stop() {
      clearInterval(spinner);
      process.stdout.write("\r");
      readline.clearLine(process.stdout, 0);
      readline.cursorTo(process.stdout, 0);
    },
  };
}

// Clear terminal
function clearTerminal() {
  // Clear terminal and move cursor to top-left
  process.stdout.write("\x1b[2J");
  process.stdout.write("\x1b[0;0H");
}

// Format duration in milliseconds to a human-readable format
function formatDuration(ms) {
  if (ms < 1000) {
    return `${ms}ms`;
  } else {
    return `${(ms / 1000).toFixed(2)}s`;
  }
}

// Create a horizontal box with a message
function createBox(message, style = {}) {
  const {
    width = process.stdout.columns - 4,
    color = colors.white,
    borderColor = colors.blue,
    padding = 1,
  } = style;

  const horizontalBorder = borderColor + "─".repeat(width) + colors.reset;
  const emptyLine =
    borderColor + "│" + " ".repeat(width - 2) + "│" + colors.reset;

  // Add padding above text
  let box = horizontalBorder + "\n";
  for (let i = 0; i < padding; i++) {
    box += emptyLine + "\n";
  }

  // Add message centered
  const paddedMessage = message
    .padStart(
      message.length + Math.floor((width - 2 - message.length) / 2),
      " "
    )
    .padEnd(width - 2, " ");
  box +=
    borderColor +
    "│" +
    color +
    paddedMessage +
    borderColor +
    "│" +
    colors.reset +
    "\n";

  // Add padding below text
  for (let i = 0; i < padding; i++) {
    box += emptyLine + "\n";
  }
  box += horizontalBorder;

  return box;
}

// Format category header
function formatCategoryHeader(category) {
  return `\n${colors.brightCyan}${colors.bold}${category}${colors.reset}\n${
    colors.brightBlack
  }${"─".repeat(process.stdout.columns * 0.8)}${colors.reset}\n`;
}

// Format test result line
function formatTestResult(test) {
  const status = test.passed
    ? `${colors.bgGreen}${colors.black} PASS ${colors.reset}`
    : `${colors.bgRed}${colors.black} FAIL ${colors.reset}`;

  const name = test.passed
    ? `${colors.green}${test.name}${colors.reset}`
    : `${colors.red}${test.name}${colors.reset}`;

  const duration = `${colors.dim}(${formatDuration(test.duration)})${
    colors.reset
  }`;

  let result = `  ${status} ${name} ${duration}`;

  if (!test.passed && test.error) {
    result += `\n    ${colors.red}${colors.dim}↳ ${test.error}${colors.reset}`;
  }

  return result;
}

// Format summary line
function formatSummary(results) {
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const total = results.length;
  const totalTime = results.reduce((sum, r) => sum + r.duration, 0);

  let summary = `\n${colors.bold}Tests:${colors.reset} `;

  if (failed > 0) {
    summary += `${colors.red}${failed} failed${colors.reset}, `;
  }

  summary += `${colors.green}${passed} passed${colors.reset}, `;
  summary += `${total} total`;
  summary += `\n${colors.bold}Time:${colors.reset} ${formatDuration(
    totalTime
  )}`;

  return summary;
}

// Main function
async function runTestSuite() {
  try {
    clearTerminal();

    // Show header
    console.log(
      createBox("Book2Text Test Suite", {
        color: colors.brightWhite + colors.bold,
        borderColor: colors.brightBlue,
        padding: 1,
      })
    );
    console.log("");

    // Run conversion tests with spinner
    const spinner = runSpinner("Running conversion tests...");
    const conversionResults = await runConversionTests();
    spinner.stop();

    // Group results by category
    const categories = {};
    conversionResults.forEach((result) => {
      if (!categories[result.category]) {
        categories[result.category] = [];
      }
      categories[result.category].push(result);
    });

    // Display results by category
    Object.keys(categories).forEach((category) => {
      console.log(formatCategoryHeader(category));
      categories[category].forEach((test) => {
        console.log(formatTestResult(test));
      });
    });

    // Summary
    console.log(formatSummary(conversionResults));

    // Exit with appropriate code
    const hasFailures = conversionResults.some((test) => !test.passed);
    if (hasFailures) {
      process.exit(1);
    }
  } catch (error) {
    console.error(
      `${colors.red}Error running tests: ${error.message}${colors.reset}`
    );
    process.exit(1);
  }
}

// Run if this script is called directly
if (require.main === module) {
  runTestSuite();
}

module.exports = {
  runTestSuite,
};
