const fs = require("fs");
const path = require("path");
const TurndownService = require("turndown");

/**
 * Ensure directory exists
 * @param {string} dirPath - Path to check/create
 */
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

/**
 * Convert HTML content to Markdown
 * @param {string} html - HTML content to convert
 * @param {Object} options - Conversion options
 * @returns {string} Markdown content
 */
const htmlToMarkdown = (html, options = {}) => {
  const turndownService = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
    emDelimiter: "*",
    ...options,
  });

  return turndownService.turndown(html);
};

/**
 * Prepare default output directory
 * @param {boolean} clean - Whether to clean the directory
 * @returns {string} Path to the output directory
 */
const prepareDefaultOutputDir = (clean = false) => {
  const baseDir = process.cwd();
  const convertedDir = path.join(baseDir, "converted");

  if (!fs.existsSync(convertedDir)) {
    fs.mkdirSync(convertedDir, { recursive: true });
    console.log(`Created output directory: ${convertedDir}`);
    return convertedDir;
  }

  if (clean) {
    const files = fs.readdirSync(convertedDir);
    files.forEach((file) => {
      const filePath = path.join(convertedDir, file);
      try {
        fs.unlinkSync(filePath);
      } catch (error) {
        console.warn(`Could not delete file ${filePath}: ${error.message}`);
      }
    });
    console.log(`Cleaned output directory: ${convertedDir}`);
  }

  return convertedDir;
};

/**
 * Display progress indication
 * @param {number} percent - Percentage complete (0-100)
 * @param {string} message - Message to display
 */
const showProgress = (percent, message = "") => {
  const width = 30;
  const completeChars = Math.floor((width * percent) / 100);
  const bar = "█".repeat(completeChars) + "░".repeat(width - completeChars);

  process.stdout.write(`\r[${bar}] ${percent.toFixed(0)}% ${message}`);

  if (percent >= 100) {
    process.stdout.write("\n");
  }
};

module.exports = {
  ensureDirectoryExists,
  htmlToMarkdown,
  prepareDefaultOutputDir,
  showProgress,
};
