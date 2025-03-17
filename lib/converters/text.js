const { htmlToMarkdown } = require("../utils");

/**
 * Convert book data to plain text format
 * @param {Object} bookData - Structured book data
 * @param {Object} options - Conversion options
 * @returns {string} - Plain text result
 */
const convertToText = (bookData, options = {}) => {
  const { includeMetadata = false } = options;
  let text = "";

  // Add title
  if (bookData.metadata && bookData.metadata.title) {
    text += `${bookData.metadata.title}\n\n`;
  }

  // Add metadata if requested
  if (includeMetadata && bookData.metadata) {
    text += `METADATA\n`;
    text += `---------\n`;
    Object.entries(bookData.metadata).forEach(([key, value]) => {
      if (value) {
        text += `${key}: ${value}\n`;
      }
    });
    text += `\n\n`;
  }

  // Add chapters content without formatting
  if (bookData.chapters && bookData.chapters.length > 0) {
    bookData.chapters.forEach((chapter) => {
      // Extract plain text from HTML content
      if (chapter.content) {
        // Convert HTML to markdown first, then strip markdown formatting
        let chapterText = htmlToMarkdown(chapter.content);

        // Simple replacements to strip markdown formatting
        chapterText = chapterText
          .replace(/#+\s+/g, "") // Remove heading markers
          .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold
          .replace(/\*(.*?)\*/g, "$1") // Remove italic
          .replace(/\[(.*?)\]\(.*?\)/g, "$1") // Remove links
          .replace(/`{1,3}(.*?)`{1,3}/g, "$1") // Remove code blocks
          .replace(/^\s*>\s*/gm, "") // Remove blockquotes
          .replace(/^\s*[-*+]\s+/gm, "") // Remove list markers
          .replace(/^\s*\d+\.\s+/gm, "") // Remove ordered list markers
          .replace(/\n{3,}/g, "\n\n"); // Normalize line breaks

        text += `${chapterText}\n\n`;
      }
    });
  }

  return text.trim();
};

module.exports = {
  convertToText,
  extension: ".txt",
};
