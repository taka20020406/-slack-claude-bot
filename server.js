const { App } = require("@slack/bolt");
const agent = require("./agent");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: false,
});

// チャンネルでのメンション
app.event("app_mention", async ({ event, say, client }) => {
  await handleMessage(event, say, client);
});

// DM
app.message(async ({ message, say, client }) => {
  if (message.channel_type === "im") {
    await handleMessage(message, say, client);
  }
});

async function handleMessage(event, say, client) {
  const threadTs = event.thread_ts || event.ts;
  const userText = event.text.replace(/<@[A-Z0-9]+>/g, "").trim();

  if (!userText) {
    await say({ text: "何か指示を送ってください！", thread_ts: threadTs });
    return;
  }

  // 「考え中...」を表示
  await say({ text: ":hourglass_flowing_sand: 処理中...", thread_ts: threadTs });

  try {
    const result = await agent.run(userText, threadTs);

    // ファイルがある場合はSlackにアップロード
    if (result.filePath) {
      await client.files.uploadV2({
        channel_id: event.channel,
        thread_ts: threadTs,
        file: require("fs").createReadStream(result.filePath),
        filename: result.fileName,
        initial_comment: result.message,
      });
    } else {
      await say({ text: result.message, thread_ts: threadTs });
    }
  } catch (error) {
    console.error("Error:", error);
    await say({
      text: ":x: エラーが発生しました。もう一度試してください。",
      thread_ts: threadTs,
    });
  }
}

(async () => {
  const port = process.env.PORT || 3000;
  await app.start(port);
  console.log(`⚡ Bot起動中 port:${port}`);
})();