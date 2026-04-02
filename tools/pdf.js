const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const TMP_DIR = "/tmp/slack-bot";
const FONT_PATH = path.join(__dirname, "../fonts/NotoSansJP-Regular.ttf");

if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

async function generate({ title, content, filename }) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(TMP_DIR, filename);
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    // 日本語フォント登録
    doc.registerFont("NotoSansJP", FONT_PATH);
    doc.font("NotoSansJP");

    // タイトル
    doc
      .fontSize(20)
      .text(title, { align: "center" })
      .moveDown(1);

    // 区切り線
    doc
      .moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .stroke()
      .moveDown(1);

    // 本文
    doc
      .fontSize(12)
      .text(content, { align: "left", lineGap: 6 });

    // フッター
    doc
      .moveDown(2)
      .fontSize(9)
      .fillColor("gray")
      .text(`生成日時: ${new Date().toLocaleString("ja-JP")}`, { align: "right" });

    doc.end();

    stream.on("finish", () => {
      resolve({
        filePath,
        fileName: filename,
        message: `✅ PDF「${filename}」を生成しました！`,
        summary: `PDFを生成しました: ${filename}`,
      });
    });

    stream.on("error", reject);
  });
}

module.exports = { generate };