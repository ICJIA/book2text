const PDFDocument = require("pdfkit");
const fs = require("fs");
const { htmlToMarkdown } = require("../utils");

/**
 * Convert book data to PDF format
 * @param {Object} bookData - Structured book data
 * @param {Object} options - Conversion options
 * @returns {Buffer} - PDF content as Buffer
 */
const convertToPdf = (bookData, options = {}) => {
  return new Promise((resolve, reject) => {
    try {
      const {
        includeMetadata = true,
        includeToc = true,
        customCss = "",
        fontSize = 12,
        pageSize = "letter",
        margins = { top: 72, bottom: 72, left: 72, right: 72 },
      } = options;

      // Create a document
      const doc = new PDFDocument({
        size: pageSize,
        margins: margins,
        bufferPages: true,
      });

      // Collect PDF content in memory
      const chunks = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));

      // Start the document
      // Title page
      doc
        .fontSize(24)
        .font("Helvetica-Bold")
        .text(bookData.metadata.title || "Untitled Book", {
          align: "center",
        });

      // Add creator if available
      if (bookData.metadata.creator) {
        doc
          .moveDown()
          .fontSize(16)
          .font("Helvetica")
          .text(`by ${bookData.metadata.creator}`, {
            align: "center",
          });
      }

      // Add metadata section
      if (includeMetadata && bookData.metadata) {
        doc
          .addPage()
          .fontSize(18)
          .font("Helvetica-Bold")
          .text("Metadata", {
            underline: true,
          })
          .moveDown();

        doc.fontSize(fontSize).font("Helvetica");

        Object.entries(bookData.metadata).forEach(([key, value]) => {
          if (value) {
            doc.text(`${key}: ${value}`);
          }
        });
      }

      // Add table of contents
      if (includeToc && bookData.toc && bookData.toc.length > 0) {
        doc
          .addPage()
          .fontSize(18)
          .font("Helvetica-Bold")
          .text("Table of Contents", {
            underline: true,
          })
          .moveDown();

        doc.fontSize(fontSize).font("Helvetica");

        bookData.toc.forEach((item, index) => {
          doc
            .text(`${index + 1}. ${item.title}`, {
              link: `#${item.id}`,
              underline: true,
            })
            .moveDown(0.5);
        });
      }

      // Add chapters
      if (bookData.chapters && bookData.chapters.length > 0) {
        bookData.chapters.forEach((chapter) => {
          doc.addPage();

          // Add bookmark for navigation
          doc.outline.addItem(chapter.title);

          // Add chapter title
          doc
            .fontSize(18)
            .font("Helvetica-Bold")
            .text(chapter.title, {
              underline: true,
            })
            .moveDown();

          // Convert HTML content to plain text (via markdown as an intermediate step)
          if (chapter.content) {
            const markdown = htmlToMarkdown(chapter.content);

            doc.fontSize(fontSize).font("Helvetica").text(markdown, {
              paragraphGap: 10,
              lineGap: 5,
            });
          } else {
            doc.text("(No content available)");
          }
        });
      }

      // Add page numbers
      const pageCount = doc.bufferedPageRange().count;
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);
        doc
          .fontSize(10)
          .text(
            `Page ${i + 1} of ${pageCount}`,
            doc.page.width / 2 - 40,
            doc.page.height - 30,
            { lineBreak: false }
          );
      }

      // Finalize the PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  convertToPdf,
  extension: ".pdf",
};
