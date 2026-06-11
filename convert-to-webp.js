const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { glob } = require("glob");

// 1. Safely grab the folder from npm's environment or fallback to process.cwd()
const rawDir = process.env.INIT_CWD || process.cwd();

// 2. WINDOWS FIX: Convert all backslashes (\) to forward slashes (/)
// Glob patterns require forward slashes, even on Windows!
const TARGET_DIR = rawDir.replace(/\\/g, "/");

async function convertJpgToWebp() {
  try {
    console.log(`Searching for JPGs in: ${TARGET_DIR} ...`);

    // 3. Create a clean glob pattern
    const globPattern = `${TARGET_DIR}/**/*.{jpg,jpeg}`;
    const files = await glob(globPattern);

    if (files.length === 0) {
      console.log("❌ No JPG images found in this directory.");
      return;
    }

    console.log(`🚀 Found ${files.length} images to convert...\n`);

    for (const file of files) {
      const ext = path.extname(file);
      const outputFilePath = file.replace(ext, ".webp");

      await sharp(file).webp({ quality: 80 }).toFile(outputFilePath);

      console.log(
        `✅ Converted: ${path.basename(file)} -> ${path.basename(outputFilePath)}`,
      );

      Optional: fs.unlinkSync(file); // Uncomment to delete originals
    }

    console.log("\n🎉 Conversion complete!");
  } catch (error) {
    console.error("❌ Error converting images:", error);
  }
}

convertJpgToWebp();
