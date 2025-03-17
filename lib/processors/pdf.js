const fs = require("fs");
const path = require("path");
const { showProgress } = require("../utils");

/**
 * Process a PDF file
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<Object>} - Extracted book data
 */
const processPdf = async (filePath) => {
  try {
    showProgress(10, "Loading PDF file...");

    // Try to load pdf-parse as an optional dependency
    let pdfParse;
    try {
      pdfParse = require("pdf-parse");
    } catch (e) {
      // Fall back to pdfjs-dist if pdf-parse is not available
      try {
        const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");
        return await processPdfWithPdfjs(filePath, pdfjsLib);
      } catch (pdfError) {
        throw new Error(
          `PDF parsing error: Could not load PDF parsing libraries. ${pdfError.message}`
        );
      }
    }

    // If pdf-parse is available, use it
    const dataBuffer = fs.readFileSync(filePath);

    showProgress(30, "Parsing PDF...");
    const pdfData = await pdfParse(dataBuffer);

    // Extract basic metadata
    const fileName = path.basename(filePath, path.extname(filePath));
    const metadata = {
      title: pdfData.info?.Title || fileName,
      creator: pdfData.info?.Author || "Unknown",
      publisher: pdfData.info?.Producer || "Unknown",
      language: "en", // PDF doesn't typically store language info
      identifier: `pdf:${fileName}`,
    };

    showProgress(70, "Extracting text content...");

    // Get the full text content
    const content = `<div class="pdf-content">${pdfData.text}</div>`;

    // Create a simple chapter - just one for the whole PDF
    const chapters = [
      {
        id: "content",
        title: "PDF Content",
        content: `<html><body>${content}</body></html>`,
      },
    ];

    // Create a simple TOC
    const toc = chapters.map((chapter, index) => ({
      id: chapter.id,
      title: chapter.title,
      order: index + 1,
    }));

    showProgress(100, "Completed processing PDF.");

    return {
      metadata,
      toc,
      chapters,
    };
  } catch (error) {
    throw new Error(`PDF processing error: ${error.message}`);
  }
};

/**
 * Alternative PDF processing using pdfjs-dist
 * @param {string} filePath - Path to the PDF file
 * @param {Object} pdfjsLib - The PDF.js library
 * @returns {Promise<Object>} - Extracted book data
 */
async function processPdfWithPdfjs(filePath, pdfjsLib) {
  // Set the worker source path
  const pdfPath = fs.readFileSync(filePath);
  const data = new Uint8Array(pdfPath);

  showProgress(30, "Parsing PDF with PDF.js...");

  // Load the PDF document
  const loadingTask = pdfjsLib.getDocument({ data });
  const pdfDocument = await loadingTask.promise;

  // Get document metadata
  const metadata = await pdfDocument.getMetadata().catch(() => ({}));

  const fileName = path.basename(filePath, path.extname(filePath));
  const bookMetadata = {
    title: metadata?.info?.Title || fileName,
    creator: metadata?.info?.Author || "Unknown",
    publisher: metadata?.info?.Producer || "Unknown",
    language: "en",
    identifier: `pdf:${fileName}`,
  };

  // Process each page to extract text
  const numPages = pdfDocument.numPages;
  let fullContent = "";

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    showProgress(
      30 + Math.floor((60 * pageNum) / numPages),
      `Processing page ${pageNum}/${numPages}...`
    );

    const page = await pdfDocument.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item) => item.str).join(" ");

    fullContent += `<div class="page" id="page${pageNum}">${pageText}</div>\n`;
  }

  // Create chapters (one per 10 pages as a simple heuristic)
  const chapters = [];
  const chapterSize = Math.max(1, Math.floor(numPages / 10));

  for (let i = 0; i < numPages; i += chapterSize) {
    const chapterNum = Math.floor(i / chapterSize) + 1;
    const endPage = Math.min(i + chapterSize - 1, numPages - 1);

    chapters.push({
      id: `chapter${chapterNum}`,
      title: `Chapter ${chapterNum} (Pages ${i + 1}-${endPage + 1})`,
      content: `<div class="chapter">${fullContent}</div>`,
    });
  }

  // Create a simple TOC
  const toc = chapters.map((chapter, index) => ({
    id: chapter.id,
    title: chapter.title,
    order: index + 1,
  }));

  showProgress(100, "Completed processing PDF.");

  return {
    metadata: bookMetadata,
    toc,
    chapters,
  };
}

module.exports = {
  processPdf,
  supportedExtensions: [".pdf"],
};
