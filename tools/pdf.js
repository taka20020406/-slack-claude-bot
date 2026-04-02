const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const TMP_DIR = "/tmp/slack-bot";

// 一時ディレクトリを作成
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

async function generate({ title, content, filename }) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(TMP_DIR, filename);
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    // フォント（日本語対応）
    // ※ 日本語フォントがない環境では文字化けする可能性あり
    // 本番では Noto Sans JP などを追加してください

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
    doc.fontSize(12).text(content, { align: "left", lineGap: 4 });

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