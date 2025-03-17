const { processEpub, supportedExtensions: epubExtensions } = require("./epub");
const { processMobi, supportedExtensions: mobiExtensions } = require("./mobi");
const { processPdf, supportedExtensions: pdfExtensions } = require("./pdf");

// Map of file extensions to processor functions
const processors = {
  ".epub": processEpub,
  ".mobi": processMobi,
  ".pdf": processPdf,
};

// Get list of all supported extensions
const supportedExtensions = [
  ...epubExtensions,
  ...mobiExtensions,
  ...pdfExtensions,
];

/**
 * Get a processor function for a given file extension
 * @param {string} extension - File extension (including dot)
 * @returns {Function|null} - Processor function or null if unsupported
 */
const getProcessor = (extension) => {
  return processors[extension.toLowerCase()] || null;
};

/**
 * Check if an extension is supported
 * @param {string} extension - File extension (including dot)
 * @returns {boolean} - Whether the extension is supported
 */
const isSupported = (extension) => {
  return supportedExtensions.includes(extension.toLowerCase());
};

module.exports = {
  getProcessor,
  isSupported,
  supportedExtensions,
};
