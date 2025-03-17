const fs = require("fs");
const path = require("path");
const { showProgress } = require("../utils");

/**
 * Process a MOBI file
 * @param {string} filePath - Path to the MOBI file
 * @returns {Promise<Object>} - Extracted book data
 */
const processMobi = async (filePath) => {
  try {
    // Show initial progress
    showProgress(10, "Reading MOBI file...");

    // Read the MOBI file as binary
    const mobiData = fs.readFileSync(filePath);

    showProgress(30, "Parsing MOBI content...");

    // Extract basic metadata from filename since mobi-js is unavailable
    const fileName = path.basename(filePath, path.extname(filePath));

    // Create simplified metadata
    const metadata = {
      title: fileName,
      creator: "Unknown (MOBI metadata extraction limited)",
      publisher: "Unknown",
      language: "en",
      identifier: `mobi:${path.basename(filePath)}`,
    };

    showProgress(50, "Extracting content (limited support)...");

    // Since we don't have a proper MOBI parser, we'll create a placeholder
    // with instructions for better conversion options
    const placeholderContent = `
      <html>
        <body>
          <h1>Limited MOBI Support</h1>
          <p>This library has limited support for direct MOBI parsing.</p>
          <p>For better results, consider:</p>
          <ul>
            <li>Converting your MOBI file to EPUB first using Calibre or similar tools</li>
            <li>Using the EPUB version with this tool</li>
          </ul>
          <p>Filename: ${fileName}</p>
        </body>
      </html>
    `;

    showProgress(80, "Creating placeholder content...");

    // Create a simple chapter structure
    const chapters = [
      {
        id: "chapter1",
        title: "Limited MOBI Support",
        content: placeholderContent,
      },
    ];

    // Create a simple TOC
    const toc = chapters.map((chapter, index) => ({
      id: chapter.id,
      title: chapter.title,
      order: index + 1,
    }));

    showProgress(100, "Completed processing MOBI file (limited support).");

    return {
      metadata,
      toc,
      chapters,
      warning:
        "MOBI format has limited support. For better results, convert to EPUB first.",
    };
  } catch (error) {
    throw new Error(
      `MOBI processing error: ${error.message} (Note: MOBI support is limited)`
    );
  }
};

module.exports = {
  processMobi,
  supportedExtensions: [".mobi"],
};
