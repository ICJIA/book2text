const fs = require("fs");
const path = require("path");
const assert = require("assert");
const { convertEbook } = require("../book2text");

// Test directory paths
const TEST_INPUT_DIR = path.join(__dirname, "fixtures");
const TEST_OUTPUT_DIR = path.join(__dirname, "output");

// Ensure test directories exist
if (!fs.existsSync(TEST_INPUT_DIR)) {
  fs.mkdirSync(TEST_INPUT_DIR, { recursive: true });
}

if (!fs.existsSync(TEST_OUTPUT_DIR)) {
  fs.mkdirSync(TEST_OUTPUT_DIR, { recursive: true });
}

// Test Categories
const CATEGORY = {
  INPUT_VALIDATION: "Input Validation",
  OUTPUT_FORMATS: "Output Formats",
  CONVERSION_OPTIONS: "Conversion Options",
  ERROR_HANDLING: "Error Handling",
};

// Test function
async function runTest(testName, testFn, category = "") {
  const startTime = Date.now();
  try {
    await testFn();
    const endTime = Date.now();
    return {
      name: testName,
      category,
      passed: true,
      duration: endTime - startTime,
    };
  } catch (error) {
    const endTime = Date.now();
    return {
      name: testName,
      category,
      passed: false,
      error: error.message,
      duration: endTime - startTime,
    };
  }
}

// Sample test: Check if converters handle missing input gracefully
async function testMissingInput() {
  const result = await convertEbook({
    input: path.join(TEST_INPUT_DIR, "non_existent_book.epub"),
    outputFormat: "json",
    outputPath: TEST_OUTPUT_DIR,
  });

  assert.strictEqual(
    result.success,
    false,
    "Should fail for missing input file"
  );
  assert.ok(
    result.error.includes("not found"),
    "Should include appropriate error message"
  );
}

// Sample test: Check if unsupported format is handled properly
async function testUnsupportedFormat() {
  // Create a temporary text file
  const testFile = path.join(TEST_INPUT_DIR, "test.txt");
  fs.writeFileSync(testFile, "This is a test file", "utf8");

  try {
    const result = await convertEbook({
      input: testFile,
      outputFormat: "json",
      outputPath: TEST_OUTPUT_DIR,
    });

    assert.strictEqual(
      result.success,
      false,
      "Should fail for unsupported format"
    );
    assert.ok(
      result.error.includes("Unsupported"),
      "Should include appropriate error message"
    );
  } finally {
    // Clean up
    if (fs.existsSync(testFile)) {
      fs.unlinkSync(testFile);
    }
  }
}

// Test for invalid output format
async function testInvalidOutputFormat() {
  // Create a mock epub file
  const mockEpub = path.join(TEST_INPUT_DIR, "mock.epub");
  fs.writeFileSync(mockEpub, "Mock EPUB file content", "utf8");

  try {
    const result = await convertEbook({
      input: mockEpub,
      outputFormat: "invalid",
      outputPath: TEST_OUTPUT_DIR,
    });

    assert.strictEqual(
      result.success,
      false,
      "Should fail for invalid output format"
    );
    assert.ok(
      result.error.includes("Unsupported"),
      "Should include appropriate error message about format"
    );
  } finally {
    // Clean up
    if (fs.existsSync(mockEpub)) {
      fs.unlinkSync(mockEpub);
    }
  }
}

// Test JSON conversion with mock data
async function testJsonConversion() {
  // Create a temporary epub file
  const mockEpub = path.join(TEST_INPUT_DIR, "mock-json.epub");
  fs.writeFileSync(mockEpub, "Mock EPUB file for JSON test", "utf8");

  // Create custom convertEbook function for testing
  const customConvertEbook = async (options) => {
    // Skip file validation and processing
    if (options.input === mockEpub && options.outputFormat === "json") {
      const mockBookData = {
        metadata: { title: "Test Book" },
        toc: [{ id: "ch1", title: "Chapter 1" }],
        chapters: [
          { id: "ch1", title: "Chapter 1", content: "<p>Test content</p>" },
        ],
      };

      // Use real JSON converter
      const { convertToJson } = require("../lib/converters/json");
      const result = convertToJson(mockBookData);

      // Write to output file
      const outputPath = path.join(TEST_OUTPUT_DIR, "mock-json.json");
      fs.writeFileSync(outputPath, result);

      return {
        success: true,
        inputFile: mockEpub,
        outputFile: outputPath,
        outputFormat: "json",
      };
    }

    // For non-mocked calls, use the real function
    return await require("../book2text").convertEbook(options);
  };

  try {
    const result = await customConvertEbook({
      input: mockEpub,
      outputFormat: "json",
      outputPath: TEST_OUTPUT_DIR,
    });

    assert.strictEqual(result.success, true, "JSON conversion should succeed");
    assert.ok(fs.existsSync(result.outputFile), "Output file should exist");

    // Check content
    const content = fs.readFileSync(result.outputFile, "utf8");
    const parsedContent = JSON.parse(content);
    assert.strictEqual(parsedContent.metadata.title, "Test Book");
  } finally {
    // Clean up
    if (fs.existsSync(mockEpub)) {
      fs.unlinkSync(mockEpub);
    }
    const jsonOutput = path.join(TEST_OUTPUT_DIR, "mock-json.json");
    if (fs.existsSync(jsonOutput)) {
      fs.unlinkSync(jsonOutput);
    }
  }
}

// Test markdown conversion with mock data
async function testMarkdownConversion() {
  // Create a temporary epub file
  const mockEpub = path.join(TEST_INPUT_DIR, "mock-md.epub");
  fs.writeFileSync(mockEpub, "Mock EPUB file for Markdown test", "utf8");

  // Create custom convertEbook function for testing
  const customConvertEbook = async (options) => {
    // Skip file validation and processing
    if (options.input === mockEpub && options.outputFormat === "markdown") {
      const mockBookData = {
        metadata: { title: "Test Book" },
        toc: [{ id: "ch1", title: "Chapter 1" }],
        chapters: [
          { id: "ch1", title: "Chapter 1", content: "<p>Test content</p>" },
        ],
      };

      // Use real Markdown converter
      const { convertToMarkdown } = require("../lib/converters/markdown");
      const result = convertToMarkdown(mockBookData);

      // Write to output file
      const outputPath = path.join(TEST_OUTPUT_DIR, "mock-md.md");
      fs.writeFileSync(outputPath, result);

      return {
        success: true,
        inputFile: mockEpub,
        outputFile: outputPath,
        outputFormat: "markdown",
      };
    }

    // For non-mocked calls, use the real function
    return await require("../book2text").convertEbook(options);
  };

  try {
    const result = await customConvertEbook({
      input: mockEpub,
      outputFormat: "markdown",
      outputPath: TEST_OUTPUT_DIR,
    });

    assert.strictEqual(
      result.success,
      true,
      "Markdown conversion should succeed"
    );
    assert.ok(fs.existsSync(result.outputFile), "Output file should exist");

    // Check content
    const content = fs.readFileSync(result.outputFile, "utf8");
    assert.ok(content.includes("# Test Book"), "Should have title");
    assert.ok(content.includes("Test content"), "Should have content");
  } finally {
    // Clean up
    if (fs.existsSync(mockEpub)) {
      fs.unlinkSync(mockEpub);
    }
    const mdOutput = path.join(TEST_OUTPUT_DIR, "mock-md.md");
    if (fs.existsSync(mdOutput)) {
      fs.unlinkSync(mdOutput);
    }
  }
}

// Test conversion with options
async function testConversionOptions() {
  // Create a temporary epub file
  const mockEpub = path.join(TEST_INPUT_DIR, "mock-options.epub");
  fs.writeFileSync(mockEpub, "Mock EPUB file for options test", "utf8");

  // Create custom convertEbook function for testing
  const customConvertEbook = async (options) => {
    // Skip file validation and processing
    if (options.input === mockEpub && options.outputFormat === "markdown") {
      const mockBookData = {
        metadata: { title: "Test Book" },
        toc: [{ id: "ch1", title: "Chapter 1" }],
        chapters: [
          { id: "ch1", title: "Chapter 1", content: "<p>Test content</p>" },
        ],
      };

      // Use real Markdown converter with specific options
      const { convertToMarkdown } = require("../lib/converters/markdown");
      const result = convertToMarkdown(mockBookData, {
        includeMetadata: options.includeMetadata,
        includeToc: options.includeToc,
        headingLevel: options.headingLevel,
        customCss: options.customCss || "",
      });

      // Write to output file
      const outputPath = path.join(TEST_OUTPUT_DIR, "mock-options.md");
      fs.writeFileSync(outputPath, result);

      return {
        success: true,
        inputFile: mockEpub,
        outputFile: outputPath,
        outputFormat: "markdown",
      };
    }

    // For non-mocked calls, use the real function
    return await require("../book2text").convertEbook(options);
  };

  try {
    const result = await customConvertEbook({
      input: mockEpub,
      outputFormat: "markdown",
      outputPath: TEST_OUTPUT_DIR,
      includeMetadata: false,
      includeToc: false,
      headingLevel: 2,
    });

    assert.strictEqual(
      result.success,
      true,
      "Conversion with options should succeed"
    );
    assert.ok(fs.existsSync(result.outputFile), "Output file should exist");

    // Check content
    const content = fs.readFileSync(result.outputFile, "utf8");
    assert.ok(content.includes("## Test Book"), "Should have level 2 heading");
    assert.ok(!content.includes("Metadata"), "Should not include metadata");
    assert.ok(!content.includes("Table of Contents"), "Should not include ToC");
  } finally {
    // Clean up
    if (fs.existsSync(mockEpub)) {
      fs.unlinkSync(mockEpub);
    }
    const mdOutput = path.join(TEST_OUTPUT_DIR, "mock-options.md");
    if (fs.existsSync(mdOutput)) {
      fs.unlinkSync(mdOutput);
    }
  }
}

// Run tests
async function runTests() {
  const tests = [
    {
      name: "Missing input file",
      fn: testMissingInput,
      category: CATEGORY.INPUT_VALIDATION,
    },
    {
      name: "Unsupported input format",
      fn: testUnsupportedFormat,
      category: CATEGORY.INPUT_VALIDATION,
    },
    {
      name: "Invalid output format",
      fn: testInvalidOutputFormat,
      category: CATEGORY.OUTPUT_FORMATS,
    },
    {
      name: "JSON conversion",
      fn: testJsonConversion,
      category: CATEGORY.OUTPUT_FORMATS,
    },
    {
      name: "Markdown conversion",
      fn: testMarkdownConversion,
      category: CATEGORY.OUTPUT_FORMATS,
    },
    {
      name: "Conversion options",
      fn: testConversionOptions,
      category: CATEGORY.CONVERSION_OPTIONS,
    },
  ];

  const results = [];

  for (const test of tests) {
    const result = await runTest(test.name, test.fn, test.category);
    results.push(result);
  }

  return results;
}

// Export for use in test runner
module.exports = {
  runTests,
};
