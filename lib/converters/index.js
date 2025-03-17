const { convertToJson, extension: jsonExtension } = require("./json");
const {
  convertToMarkdown,
  extension: markdownExtension,
} = require("./markdown");
const { convertToText, extension: textExtension } = require("./text");

// Map of format names to converter functions
const converters = {
  json: convertToJson,
  markdown: convertToMarkdown,
  md: convertToMarkdown,
  text: convertToText,
  txt: convertToText,
  // Remove pdf from the converters
};

// Map of format names to file extensions
const extensions = {
  json: jsonExtension,
  markdown: markdownExtension,
  md: markdownExtension,
  text: textExtension,
  txt: textExtension,
  // Remove pdf from the extensions
};

/**
 * Get a converter function for a given format
 * @param {string} format - Format name (json, markdown, md)
 * @returns {Function|null} - Converter function or null if unsupported
 */
const getConverter = (format) => {
  return converters[format.toLowerCase()] || null;
};

/**
 * Get the file extension for a given format
 * @param {string} format - Format name (json, markdown, md)
 * @returns {string|null} - File extension or null if unsupported
 */
const getExtension = (format) => {
  return extensions[format.toLowerCase()] || null;
};

/**
 * Check if a format is supported
 * @param {string} format - Format name
 * @returns {boolean} - Whether the format is supported
 */
const isSupported = (format) => {
  return Object.keys(converters).includes(format.toLowerCase());
};

/**
 * Get list of all supported formats
 * @returns {string[]} - List of supported format names
 */
const supportedFormats = () => {
  return Object.keys(converters);
};

module.exports = {
  getConverter,
  getExtension,
  isSupported,
  supportedFormats,
};
