# Voice agent: Worker setup

The chat widget's voice call (the waveform button) talks to **Gemini Live** directly from the
browser. Your Gemini API key never leaves the Cloudflare Worker. Before each call, the widget
asks the Worker for a short-lived, single-use token with the model, voice and instructions locked
in, so a visitor can't use it for anything else.

Until the Worker has the `/live-token` route below, the waveform button shows "Sorry, I couldn't
start the voice conversation…" with the resume link and email.

## 1. Add this code to the Worker

In the Cloudflare dashboard: **Workers & Pages → wandering-union-2c45 → Edit code**. Paste this
block near the top of the file, outside the `fetch` handler:

```js
// ---- Gemini Live voice calls: short-lived tokens for the chat widget ----
const LIVE_MODEL = "models/gemini-3.8-live";
const LIVE_VOICE = "Sulafat"; // warm voice; others: Kore, Achird, Aoede, Charon, Puck…
const LIVE_RULES = `
You are now speaking out loud in a live voice call, not typing.
- Reply in the language the visitor speaks: English, Hindi, Kannada or Bengali. If they switch language, switch with them.
- Keep answers short and natural: two or three sentences, then offer more detail.
- Never read out web addresses or email addresses. Say "the resume link in the chat" or "the email address in the chat" instead.`;

async function handleLiveToken(env, corsHeaders) {
  const now = Date.now();
  const instructions = { parts: [{ text: SYSTEM_PROMPT + "\n" + LIVE_RULES }] };
  const speechConfig = { voiceConfig: { prebuiltVoiceConfig: { voiceName: LIVE_VOICE } } };
  const base = {
    uses: 1, // one call per token
    expireTime: new Date(now + 6 * 60 * 1000).toISOString(), // the widget ends calls at 5 minutes
    newSessionExpireTime: new Date(now + 60 * 1000).toISOString(), // must connect within 1 minute
  };
  // Google's docs show two shapes for the locked setup; try the API-reference one first.
  const bodies = [
    {
      ...base,
      bidiGenerateContentSetup: {
        model: LIVE_MODEL,
        generationConfig: { responseModalities: ["AUDIO"], speechConfig },
        systemInstruction: instructions,
        inputAudioTranscription: {},
        outputAudioTranscription: {},
      },
    },
    {
      ...base,
      liveConnectConstraints: {
        model: LIVE_MODEL,
        config: {
          responseModalities: ["AUDIO"],
          speechConfig,
          systemInstruction: instructions,
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
      },
    },
  ];
  for (const body of bodies) {
    const r = await fetch("https://generativelanguage.googleapis.com/v1beta/auth_tokens", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY },
      body: JSON.stringify(body),
    });
    if (r.ok) {
      const { name } = await r.json();
      return new Response(JSON.stringify({ token: name }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    console.log("live-token", r.status, await r.text()); // shows in the Worker's logs
    if (r.status !== 400) break; // 400 = Google didn't accept this shape; try the other one
  }
  return new Response(JSON.stringify({ error: "voice unavailable" }), {
    status: 502,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
```

Then, **inside** the `fetch` handler, **after** the existing Origin check, add:

```js
if (request.method === "POST" && new URL(request.url).pathname === "/live-token") {
  return handleLiveToken(env, corsHeaders);
}
```

Match three names to your existing code:

| In the snippet | Replace with |
| --- | --- |
| `SYSTEM_PROMPT` | the constant holding your chat's instructions about Rohit |
| `env.GEMINI_API_KEY` | however your Worker reads the Gemini key |
| `corsHeaders` | the object your Worker uses for `Access-Control-Allow-Origin` |

Click **Deploy**.

## 2. Make sure text chat replies in the visitor's language too

The voice rules above handle calls. For typed chat, add this line to `SYSTEM_PROMPT` itself.
Right now the Worker answers Kannada and Bengali questions in English:

> Always reply in the same language and script as the visitor's latest message: Hindi in
> Devanagari, Kannada in Kannada script, Bengali in Bengali script, otherwise English.

## 3. Test it

1. Open the site (or `npm run dev` on `http://localhost:3000`, once that origin is in
   `ALLOWED_ORIGINS`), open the chat and tap the waveform button.
2. Allow the microphone. The bar should say "Listening…". Speak in Hindi, Kannada or Bengali.
3. If you see the "couldn't start" message, open the Worker's **Logs** tab. The `live-token` line
   shows Google's error.

## Costs and limits

- Gemini Live bills audio in and out per token, so calls cost more than text chat. The widget
  ends each call after 5 minutes, and each token works for one call only.
- Anyone on an allowed origin can start calls. If you see abuse, add a Cloudflare rate-limiting
  rule on `/live-token`.
- Echo: the browser's echo cancellation keeps the assistant from hearing itself on most laptops
  and phones. On loud speakers it may interrupt itself, and headphones fix that.
