const fs = require("fs");
const path = require("path");
const readline = require("readline");
const {
  getProcessor,
  isSupported: isSupportedInput,
} = require("./lib/processors");
const {
  getConverter,
  getExtension,
  isSupported: isSupportedOutput,
} = require("./lib/converters");
const {
  ensureDirectoryExists,
  prepareDefaultOutputDir,
  showProgress,
} = require("./lib/utils");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

/**
 * Main conversion function
 * @param {Object} options - Conversion options
 * @returns {Promise<Object>} - Result of the conversion
 */
const convertEbook = async (options) => {
  const {
    input,
    outputFormat,
    outputPath,
    cleanOutput,
    filter = null,
    includeMetadata = true,
    includeToc = true,
    customCss = "",
    headingLevel = 1,
    turndownOptions = {},
  } = options;

  // Validate input file exists
  if (!fs.existsSync(input)) {
    return {
      success: false,
      error: `Input file not found: ${input}`,
    };
  }

  const fileExt = path.extname(input).toLowerCase();

  // Show warning for MOBI files
  if (fileExt === ".mobi") {
    console.warn(
      "\nWARNING: MOBI support is limited. For best results, convert to EPUB first.\n"
    );
  }

  // Validate supported input format
  if (!isSupportedInput(fileExt)) {
    return {
      success: false,
      error: `Unsupported input format: ${fileExt}`,
    };
  }

  // Validate supported output format
  if (!isSupportedOutput(outputFormat)) {
    return {
      success: false,
      error: `Unsupported output format: ${outputFormat}`,
    };
  }

  try {
    // Get appropriate processor and converter
    const processFile = getProcessor(fileExt);
    const convertData = getConverter(outputFormat);
    const extension = getExtension(outputFormat);

    if (!processFile || !convertData) {
      throw new Error("Failed to find appropriate processor or converter");
    }

    // Process the input file
    console.log(`Processing ${path.basename(input)}...`);
    const bookData = await processFile(input);

    // Convert to requested output format
    console.log(`Converting to ${outputFormat}...`);
    const result = await convertData(bookData, {
      pretty: true,
      filter,
      includeMetadata,
      includeToc,
      customCss,
      headingLevel,
      turndownOptions,
    });

    // Determine output file path
    let outputFilePath;
    if (outputPath) {
      // If outputPath is a directory, append filename
      if (fs.existsSync(outputPath) && fs.statSync(outputPath).isDirectory()) {
        const baseName = path.basename(input, path.extname(input));
        outputFilePath = path.join(outputPath, `${baseName}${extension}`);
      } else {
        // If outputPath has no extension, add the correct one
        if (path.extname(outputPath) === "") {
          outputFilePath = `${outputPath}${extension}`;
        } else {
          outputFilePath = outputPath;
        }
      }
    } else {
      // Default to the ./converted/ directory
      const defaultDir = prepareDefaultOutputDir(cleanOutput);
      const baseName = path.basename(input, path.extname(input));
      outputFilePath = path.join(defaultDir, `${baseName}${extension}`);
    }

    // Ensure output directory exists
    ensureDirectoryExists(path.dirname(outputFilePath));

    // Write result to file
    fs.writeFileSync(outputFilePath, result);

    return {
      success: true,
      inputFile: input,
      outputFile: outputFilePath,
      outputFormat,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * CLI implementation
 */
const runCli = async () => {
  const argv = yargs(hideBin(process.argv))
    .usage("Usage: $0 [options]")
    .option("input", {
      alias: "i",
      describe: "Input ebook file path (epub, mobi, pdf)",
      type: "string",
      demandOption: true,
    })
    .option("format", {
      alias: "f",
      describe: "Output format: json, markdown, or text (default: markdown)",
      type: "string",
      choices: ["json", "markdown", "md", "text", "txt"],
      default: "markdown",
    })
    .option("output", {
      alias: "o",
      describe: "Output directory or file path (default: ./converted/)",
      type: "string",
    })
    .option("clean", {
      alias: "c",
      describe: "Clean the output directory before conversion (default: false)",
      type: "boolean",
      default: false,
    })
    .option("no-metadata", {
      describe: "Exclude metadata from the output (default: include metadata)",
      type: "boolean",
      default: false,
    })
    .option("no-toc", {
      describe:
        "Exclude table of contents from the output (default: include TOC)",
      type: "boolean",
      default: false,
    })
    .option("heading-level", {
      describe: "Base heading level for markdown output: 1-6 (default: 1)",
      type: "number",
      default: 1,
    })
    .option("css", {
      describe: "Custom CSS to include in markdown output (default: none)",
      type: "string",
    })
    .example(
      "$0 -i book.epub",
      "Convert book.epub to Markdown (default format)"
    )
    .example(
      "$0 -i book.mobi -f json -o ./output/book-data.json",
      "Convert book.mobi to JSON with custom output path"
    )
    .example("$0 -i book.pdf -f text", "Convert PDF to plain text")
    .example(
      "$0 -i book.epub --no-metadata --no-toc",
      "Convert without metadata and TOC"
    )
    .example(
      "$0 -i book.epub --heading-level=2 --css='body { font-family: Arial; }'",
      "Convert with custom heading level and CSS"
    )
    .help()
    .alias("help", "h").argv;

  try {
    // Check if output directory is to be cleaned
    if (argv.clean) {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      const confirm = await new Promise((resolve) => {
        rl.question(
          "Are you sure you want to clean the output directory? All files will be deleted. (yes/no): ",
          (answer) => {
            rl.close();
            resolve(answer.toLowerCase() === "yes");
          }
        );
      });

      if (!confirm) {
        console.log("Operation cancelled by user.");
        process.exit(0);
      }
    }

    const result = await convertEbook({
      input: argv.input,
      outputFormat: argv.format,
      outputPath: argv.output,
      cleanOutput: argv.clean,
      includeMetadata: !argv.noMetadata,
      includeToc: !argv.noToc,
      headingLevel: argv.headingLevel,
      customCss: argv.css || "",
    });

    if (result.success) {
      console.log(`Conversion successful!`);
      console.log(`Input: ${result.inputFile}`);
      console.log(`Output: ${result.outputFile}`);
      console.log(`Format: ${result.outputFormat}`);
    } else {
      console.error(`Conversion failed: ${result.error}`);
      process.exit(1);
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Check if being run directly via CLI
if (require.main === module) {
  runCli();
}

// Export for use as a module
module.exports = {
  convertEbook,
  runCli,
};
