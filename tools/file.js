const fs = require("fs");
const path = require("path");

const TMP_DIR = "/tmp/slack-bot";
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

async function create({ filename, content }) {
  const filePath = path.join(TMP_DIR, filename);
  fs.writeFileSync(filePath, content, "utf8");

  return {
    filePath,
    fileName: filename,
    message: `✅ ファイル「${filename}」を作成しました！`,
    summary: `ファイルを作成しました: ${filename}`,
  };
}

module.exports = { create };