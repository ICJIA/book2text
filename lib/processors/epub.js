const EPub = require("epub");
const { showProgress } = require("../utils");

/**
 * Process an ePub file
 * @param {string} filePath - Path to the ePub file
 * @returns {Promise<Object>} - Extracted book data
 */
const processEpub = async (filePath) => {
  const epub = new EPub(filePath);

  return new Promise((resolve, reject) => {
    epub.on("error", reject);

    epub.on("end", async () => {
      try {
        // Show initial progress
        showProgress(10, "Reading metadata...");

        // Get book metadata
        const metadata = {
          title: epub.metadata.title,
          creator: epub.metadata.creator,
          publisher: epub.metadata.publisher,
          language: epub.metadata.language,
          identifier: epub.metadata.identifier,
        };

        showProgress(20, "Processing chapters...");

        // Get chapters/content
        const chapters = [];
        const getChapterPromises = [];

        epub.flow.forEach((chapter, index) => {
          if (chapter.id) {
            const promise = new Promise((resolveChapter) => {
              epub.getChapter(chapter.id, (err, text) => {
                // Update progress for each chapter
                showProgress(
                  20 + Math.floor((70 * (index + 1)) / epub.flow.length),
                  `Processing chapter ${index + 1}/${epub.flow.length}...`
                );

                if (err) {
                  resolveChapter({
                    id: chapter.id,
                    title: `Chapter ${index + 1}`,
                    content: "",
                    error: err.message,
                  });
                } else {
                  resolveChapter({
                    id: chapter.id,
                    title: chapter.title || `Chapter ${index + 1}`,
                    content: text,
                  });
                }
              });
            });
            getChapterPromises.push(promise);
          }
        });

        const chapterResults = await Promise.all(getChapterPromises);
        chapters.push(...chapterResults);

        showProgress(100, "Completed processing ePub.");

        // Return structured data
        resolve({
          metadata,
          toc: epub.toc,
          chapters,
        });
      } catch (error) {
        reject(error);
      }
    });

    epub.parse();
  });
};

module.exports = {
  processEpub,
  supportedExtensions: [".epub"],
};
