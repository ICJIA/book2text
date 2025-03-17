/**
 * Convert book data to JSON format
 * @param {Object} bookData - Structured book data
 * @param {Object} options - Conversion options
 * @returns {string} - JSON string result
 */
const convertToJson = (bookData, options = {}) => {
  const { pretty = true, filter = null } = options;

  // Apply filter if provided
  let filteredData = bookData;
  if (filter && typeof filter === "function") {
    filteredData = filter(bookData);
  }

  // Stringify with or without pretty formatting
  return JSON.stringify(filteredData, null, pretty ? 2 : 0);
};

module.exports = {
  convertToJson,
  extension: ".json",
};
