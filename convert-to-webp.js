const path = require("path");
const sharp = require("sharp");
const { glob } = require("glob");

// Convert the caller's directory without touching dependency or build folders.
const rawDir = process.env.INIT_CWD || process.cwd();

// Glob patterns require forward slashes on Windows too.
const TARGET_DIR = rawDir.replace(/\\/g, "/");

async function convertJpgToWebp() {
  try {
    console.log(`Searching for JPGs in: ${TARGET_DIR} ...`);

    const globPattern = `${TARGET_DIR}/**/*.{jpg,jpeg}`;
    const files = await glob(globPattern, {
      ignore: [
        "**/node_modules/**",
        "**/android/**",
        "**/ios/**",
        "**/.*/**",
        "**/dist/**",
        "**/web-build/**",
      ],
    });

    if (files.length === 0) {
      console.log("❌ No JPG images found in this directory.");
      return;
    }

    console.log(`🚀 Found ${files.length} images to convert...\n`);

    for (const file of files) {
      const ext = path.extname(file);
      const outputFilePath = file.replace(ext, ".webp");

      // Keep source files; conversion must never delete originals.
      await sharp(file).webp({ quality: 80 }).toFile(outputFilePath);

      console.log(
        `✅ Converted: ${path.basename(file)} -> ${path.basename(outputFilePath)}`,
      );
    }

    console.log("\n🎉 Conversion complete!");
  } catch (error) {
    console.error("❌ Error converting images:", error);
  }
}

convertJpgToWebp();
