const { htmlToMarkdown } = require("../utils");

/**
 * Convert book data to Markdown format
 * @param {Object} bookData - Structured book data
 * @param {Object} options - Conversion options
 * @returns {string} - Markdown string result
 */
const convertToMarkdown = (bookData, options = {}) => {
  const {
    includeMetadata = true,
    includeToc = true,
    headingLevel = 1,
    customCss = "",
  } = options;

  // Helper to generate heading markers
  const getHeading = (level) =>
    "#".repeat(Math.min(6, Math.max(1, headingLevel + level - 1)));

  let markdown = `${getHeading(1)} ${
    bookData.metadata.title || "Untitled Book"
  }\n\n`;

  // Add custom CSS if provided
  if (customCss) {
    markdown += `<style>\n${customCss}\n</style>\n\n`;
  }

  // Add metadata section
  if (includeMetadata && bookData.metadata) {
    markdown += `${getHeading(2)} Metadata\n\n`;
    Object.entries(bookData.metadata).forEach(([key, value]) => {
      if (value) {
        markdown += `- **${key}**: ${value}\n`;
      }
    });
    markdown += "\n";
  }

  // Add table of contents
  if (includeToc && bookData.toc && bookData.toc.length > 0) {
    markdown += `${getHeading(2)} Table of Contents\n\n`;
    bookData.toc.forEach((item, index) => {
      markdown += `${index + 1}. [${item.title}](#${item.id})\n`;
    });
    markdown += "\n";
  }

  // Add chapters
  if (bookData.chapters && bookData.chapters.length > 0) {
    bookData.chapters.forEach((chapter) => {
      markdown += `${getHeading(2)} ${chapter.title}\n\n`;

      // Convert HTML content to Markdown
      if (chapter.content) {
        markdown +=
          htmlToMarkdown(chapter.content, options.turndownOptions || {}) +
          "\n\n";
      } else {
        markdown += "(No content available)\n\n";
      }
    });
  }

  return markdown;
};

module.exports = {
  convertToMarkdown,
  extension: ".md",
};
