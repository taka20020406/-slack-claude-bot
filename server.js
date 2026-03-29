const { App } = require("@slack/bolt");
const Anthropic = require("@anthropic-ai/sdk");

// ── 環境変数 ──────────────────────────────────────────────
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: false,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// 会話履歴を一時保管（メモリ内・再起動でリセット）
const conversationHistory = {};

// ── メンション or DM に反応 ───────────────────────────────
app.event("app_mention", async ({ event, say }) => {
  await handleMessage(event, say);
});

app.message(async ({ message, say }) => {
  // DMのみ反応（チャンネルはメンション時のみ）
  if (message.channel_type === "im") {
    await handleMessage(message, say);
  }
});

// ── メッセージ処理 ────────────────────────────────────────
async function handleMessage(event, say) {
  const userId = event.user;
  const threadTs = event.thread_ts || event.ts;

  // メンション文字列を除去（<@UXXXXXXXX> を削除）
  const userText = event.text.replace(/<@[A-Z0-9]+>/g, "").trim();

  if (!userText) {
    await say({ text: "何かメッセージを送ってください！", thread_ts: threadTs });
    return;
  }

  // 会話履歴の初期化
  if (!conversationHistory[threadTs]) {
    conversationHistory[threadTs] = [];
  }

  // ユーザーメッセージを追加
  conversationHistory[threadTs].push({
    role: "user",
    content: userText,
  });

  try {
    // 「入力中...」を表示
    await say({ text: ":hourglass_flowing_sand: 考え中...", thread_ts: threadTs });

    // Claude API 呼び出し
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system:
        "あなたは親切なSlackアシスタントです。日本語で簡潔に回答してください。",
      messages: conversationHistory[threadTs],
    });

    const assistantMessage = response.content[0].text;

    // アシスタントの返答を履歴に追加
    conversationHistory[threadTs].push({
      role: "assistant",
      content: assistantMessage,
    });

    // 履歴が長くなりすぎたら古いものを削除（直近10往復を保持）
    if (conversationHistory[threadTs].length > 20) {
      conversationHistory[threadTs] = conversationHistory[threadTs].slice(-20);
    }

    await say({ text: assistantMessage, thread_ts: threadTs });
  } catch (error) {
    console.error("Error calling Claude API:", error);
    await say({
      text: ":x: エラーが発生しました。しばらくしてからもう一度お試しください。",
      thread_ts: threadTs,
    });
  }
}

// ── サーバー起動 ──────────────────────────────────────────
(async () => {
  const port = process.env.PORT || 3000;
  await app.start(port);
  console.log(`⚡ Slack bot is running on port ${port}`);
})();
