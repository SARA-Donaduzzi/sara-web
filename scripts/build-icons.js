const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputIcon = path.join(__dirname, "../public/icon-source.png");
const outputDir = path.join(__dirname, "../public/icons");

// Criar diretório de saída se não existir
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generateIcons() {
  for (const size of sizes) {
    try {
      await sharp(inputIcon)
        .resize(size, size)
        .png()
        .toFile(path.join(outputDir, `icon-${size}x${size}.png`));
    } catch (error) {
      null;
    }
  }
}

// Verificar se o arquivo fonte existe
if (!fs.existsSync(inputIcon)) {
  process.exit(1);
}

generateIcons();
