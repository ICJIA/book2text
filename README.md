# book2text

A command-line tool to convert e-books (ePub, MOBI, and PDF) to text-based formats (JSON, Markdown, plain text). If the files are copy proected, this script will fail.

## Features

- Convert e-books to structured JSON
- Convert e-books to readable Markdown
- Extract raw text content without formatting
- Extract metadata, table of contents, and chapter content
- Simple command-line interface

## Installation

### Global Installation (Recommended for CLI usage)

```bash
# Install globally
npm install -g book2text

# Verify installation
book2text --help
```

This allows you to run `book2text` from anywhere in your terminal.

### Local Installation

```bash
# Install locally in your project
npm install book2text

# Run using npx
npx book2text --input book.epub
```

## Usage

### Command Line

```bash
book2text --input <file-path> [options]
```

Options:

- `--input`, `-i`: Path to the input ePub, MOBI, or PDF file (required)
- `--format`, `-f`: Output format: "json", "markdown", or "text" (default: "markdown")
- `--output`, `-o`: Output directory or file path (default: "./converted/")
- `--clean`, `-c`: Clean the output directory before conversion (default: false)
- `--no-metadata`: Exclude metadata from the output (default: include metadata)
- `--no-toc`: Exclude table of contents from the output (default: include TOC)
- `--heading-level`: Base heading level for markdown output: 1-6 (default: 1)
- `--css`: Custom CSS to include in markdown output (default: none)
- `--help`, `-h`: Show help

### Examples

#### Basic Usage

```bash
# Simple conversion (defaults to markdown format)
book2text -i book.epub

# Convert to JSON format
book2text -i book.epub -f json

# Convert to plain text
book2text -i book.epub -f text
```

#### Output Customization

```bash
# Custom output path
book2text -i book.epub -o ./my-output/book.md

# Clean output directory first
book2text -i book.epub -c

# Exclude metadata and table of contents
book2text -i book.epub --no-metadata --no-toc

# Customize heading levels (start at H2 instead of H1)
book2text -i book.epub --heading-level=2

# Add custom CSS (for Markdown output)
book2text -i book.epub --css="body { font-family: Arial; max-width: 800px; margin: 0 auto; }"
```

### JavaScript API

```javascript
const { convertEbook } = require("book2text");

const run = async () => {
  // Basic conversion
  const result = await convertEbook({
    input: "./my-book.epub",
    outputFormat: "markdown", // default
    outputPath: "./output/",
  });

  // Advanced options
  const resultWithOptions = await convertEbook({
    input: "./my-book.epub",
    outputFormat: "json",
    outputPath: "./output/",
    cleanOutput: true,
    includeMetadata: false,
    includeToc: false,
    headingLevel: 2,
    customCss: "body { font-family: Arial; }",
  });

  if (result.success) {
    console.log(`Converted to: ${result.outputFile}`);
  } else {
    console.error(`Error: ${result.error}`);
  }
};

run();
```

## Supported Formats

**Input Formats:**

- ePub (.epub)
- MOBI (.mobi) - limited support, best to convert to ePub first
- PDF (.pdf)

**Output Formats:**

- JSON (.json) - structured output with metadata, TOC, and content
- Markdown (.md) - formatted text with headings, links, and styling
- Plain Text (.txt) - raw text without formatting

## License

MIT
