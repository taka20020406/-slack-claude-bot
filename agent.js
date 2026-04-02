const Anthropic = require("@anthropic-ai/sdk");
const pdfTool = require("./tools/pdf");
const diagramTool = require("./tools/diagram");
const fileTool = require("./tools/file");

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// 会話履歴（スレッドIDをキーに保持）
const conversationHistory = {};

// ── ツール定義（Claude に渡す） ────────────────────────────
const tools = [
  {
    name: "generate_pdf",
    description: "テキストや内容からPDFファイルを生成する。「PDFを作って」「PDF化して」などの指示に使う。",
    input_schema: {
      type: "object",
      properties: {
        title: { type: "string", description: "PDFのタイトル" },
        content: { type: "string", description: "PDFに含めるテキスト内容" },
        filename: { type: "string", description: "保存するファイル名（例: report.pdf）" },
      },
      required: ["title", "content", "filename"],
    },
  },
  {
    name: "generate_diagram",
    description: "オブジェクト構成図やフローチャートなどの図をPDF/PNG形式で生成する。「構成図を作って」「図にして」などの指示に使う。",
    input_schema: {
      type: "object",
      properties: {
        type: { type: "string", enum: ["flowchart", "object_diagram"], description: "図の種類" },
        title: { type: "string", description: "図のタイトル" },
        content: { type: "string", description: "図に含める内容・要素の説明" },
        filename: { type: "string", description: "保存するファイル名（例: diagram.png）" },
      },
      required: ["type", "title", "content", "filename"],
    },
  },
  {
    name: "create_file",
    description: "テキストファイルやMarkdownファイルを作成する。「ファイルを作って」「テキストを保存して」などの指示に使う。",
    input_schema: {
      type: "object",
      properties: {
        filename: { type: "string", description: "ファイル名（例: memo.txt, report.md）" },
        content: { type: "string", description: "ファイルに書き込む内容" },
      },
      required: ["filename", "content"],
    },
  },
];

// ── ツール実行 ─────────────────────────────────────────────
async function executeTool(toolName, toolInput) {
  switch (toolName) {
    case "generate_pdf":
      return await pdfTool.generate(toolInput);
    case "generate_diagram":
      return await diagramTool.generate(toolInput);
    case "create_file":
      return await fileTool.create(toolInput);
    default:
      throw new Error(`未知のツール: ${toolName}`);
  }
}

// ── エージェント実行 ───────────────────────────────────────
async function run(userText, threadTs) {
  // 会話履歴の初期化
  if (!conversationHistory[threadTs]) {
    conversationHistory[threadTs] = [];
  }

  conversationHistory[threadTs].push({
    role: "user",
    content: userText,
  });

  // 履歴上限（20件）
  if (conversationHistory[threadTs].length > 20) {
    conversationHistory[threadTs] = conversationHistory[threadTs].slice(-20);
  }

  // Claude API呼び出し（ツール使用あり）
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    system: `あなたは親切なSlackアシスタントです。
ユーザーの指示に応じて適切なツールを使い、日本語で回答してください。
PDFや図の生成を求められた場合は必ずツールを使ってください。`,
    tools,
    messages: conversationHistory[threadTs],
  });

  // ツール使用の場合
  if (response.stop_reason === "tool_use") {
    const toolUseBlock = response.content.find((b) => b.type === "tool_use");
    const toolResult = await executeTool(toolUseBlock.name, toolUseBlock.input);

    // 履歴にアシスタントとツール結果を追加
    conversationHistory[threadTs].push({ role: "assistant", content: response.content });
    conversationHistory[threadTs].push({
      role: "user",
      content: [{ type: "tool_result", tool_use_id: toolUseBlock.id, content: toolResult.summary }],
    });

    // ファイル生成結果を返す
    return {
      message: toolResult.message,
      filePath: toolResult.filePath || null,
      fileName: toolResult.fileName || null,
    };
  }

  // 通常テキスト返答
  const assistantMessage = response.content.find((b) => b.type === "text")?.text || "応答を取得できませんでした。";
  conversationHistory[threadTs].push({ role: "assistant", content: assistantMessage });

  return { message: assistantMessage };
}

module.exports = { run };