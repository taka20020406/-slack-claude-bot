const fs = require("fs");
const path = require("path");

const TMP_DIR = "/tmp/slack-bot";
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

async function generate({ type, title, content, filename }) {
  // Mermaid記法のダイアグラム定義をClaudeが生成した内容をもとに作成
  const mermaidCode = buildMermaidCode(type, content);

  // HTMLファイルとして出力（Slackに送信）
  const htmlContent = `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<title>${title}</title>
<script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
<style>
  body { font-family: sans-serif; padding: 32px; background: #fff; }
  h1 { font-size: 1.4rem; color: #1a1a1a; border-bottom: 2px solid #1F4E79; padding-bottom: 8px; }
  .mermaid { margin-top: 24px; }
  .generated { font-size: 0.75rem; color: #888; margin-top: 24px; text-align: right; }
</style>
</head>
<body>
<h1>${title}</h1>
<div class="mermaid">
${mermaidCode}
</div>
<p class="generated">生成日時: ${new Date().toLocaleString("ja-JP")}</p>
<script>mermaid.initialize({ startOnLoad: true, theme: "default" });</script>
</body>
</html>`;

  const htmlFilename = filename.replace(/\.(png|pdf)$/, ".html");
  const filePath = path.join(TMP_DIR, htmlFilename);
  fs.writeFileSync(filePath, htmlContent, "utf8");

  return {
    filePath,
    fileName: htmlFilename,
    message: `✅ 構成図「${htmlFilename}」を生成しました！`,
    summary: `構成図を生成しました: ${htmlFilename}`,
  };
}

function buildMermaidCode(type, content) {
  if (type === "flowchart") {
    return `flowchart TD\n${content}`;
  } else if (type === "object_diagram") {
    return `graph LR\n${content}`;
  }
  return `graph TD\n${content}`;
}

module.exports = { generate };