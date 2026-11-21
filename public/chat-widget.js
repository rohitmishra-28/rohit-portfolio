// Drop-in chat widget with voice. Add to your site with:
//   <script src="/chat-widget.js" defer></script>
// (put this file in your site's public/ folder). No dependencies.
//
// Voice: mic button = speak your question (Chrome, Edge, Safari). Speaker button = bot reads answers aloud.
// Voice replies switch on automatically when a visitor uses the mic.
// Languages: English, हिन्दी, ಕನ್ನಡ, বাংলা. Pick in the header (needed for the mic);
// spoken replies auto-detect the reply's script and use a matching voice if the device has one.
//
// Voice conversation (waveform button): a live, hands-free call through Gemini Live. The Worker's
// /live-token route mints a short-lived, single-use token with the model, voice and instructions
// locked in; the browser streams mic audio to Gemini and plays its spoken replies, and both sides
// appear as text in the chat. Gemini picks up the visitor's language itself.

(() => {
  const API_URL = "https://wandering-union-2c45.irohitm89.workers.dev"; // your Cloudflare Worker
  const RESUME_URL = "https://rohitkumarmishra.com/resume.pdf";
  const EMAIL = "hello@rohitkumarmishra.com";
  const GREETING =
    "Hi! I'm Rohit's assistant. Ask me about his experience, skills or projects, or grab his resume. Type or tap the mic to talk, in English, हिन्दी, ಕನ್ನಡ or বাংলা (pick the language at the top).";

  const LANGS = {
    "en-IN": { label: "EN", name: "English", resume: "the resume link in the chat", link: "the link in the chat", email: "the email address shown in the chat", listening: "Listening…", ph: "Type or tap the mic…" },
    "hi-IN": { label: "हिं", name: "हिन्दी", resume: "चैट में दिया गया रिज़्यूमे लिंक", link: "चैट में दिया गया लिंक", email: "चैट में दिया गया ईमेल पता", listening: "सुन रहा हूँ…", ph: "लिखें या माइक दबाएँ…" },
    "kn-IN": { label: "ಕ", name: "ಕನ್ನಡ", resume: "ಚಾಟ್‌ನಲ್ಲಿರುವ ರೆಸ್ಯೂಮೆ ಲಿಂಕ್", link: "ಚಾಟ್‌ನಲ್ಲಿರುವ ಲಿಂಕ್", email: "ಚಾಟ್‌ನಲ್ಲಿರುವ ಇಮೇಲ್ ವಿಳಾಸ", listening: "ಕೇಳುತ್ತಿದ್ದೇನೆ…", ph: "ಟೈಪ್ ಮಾಡಿ ಅಥವಾ ಮೈಕ್ ಒತ್ತಿ…" },
    "bn-IN": { label: "বা", name: "বাংলা", resume: "চ্যাটে দেওয়া রেজিউমে লিংক", link: "চ্যাটে দেওয়া লিংক", email: "চ্যাটে দেওয়া ইমেল ঠিকানা", listening: "শুনছি…", ph: "লিখুন বা মাইক চাপুন…" },
  };
  let lang = "en-IN"; // current language for the mic

  // Detect language from script (used for typed messages and for choosing the reply voice)
  const detectLang = (t) =>
    /[\u0C80-\u0CFF]/.test(t) ? "kn-IN" :
    /[\u0980-\u09FF]/.test(t) ? "bn-IN" :
    /[\u0900-\u097F]/.test(t) ? "hi-IN" : null;

  const history = [];
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const canSpeak = "speechSynthesis" in window;
  let speakReplies = false;
  let recognizing = false;
  let recognition = null;

  // Styles use the site's design tokens (src/styles/tokens.css) with
  // hard-coded fallbacks, so the widget still looks right on its own.
  // z-index 30: above the site header (20), below the skip link (100).
  const css = `
  #rkm-chat-btn,#rkm-chat{--rkm-forest:var(--color-forest,#18291f);--rkm-parchment:var(--color-parchment,#f5ebdd);
    --rkm-ivory:var(--color-warm-ivory,#fbf6ed);--rkm-linen:var(--color-linen,#f2e8d1);--rkm-ink:var(--color-ink,#1e211b);
    --rkm-border:var(--color-border-light,#dcd0bc);--rkm-accent:var(--color-terracotta,#c65b32);
    --rkm-accent-strong:var(--color-burnt-sienna,#a94627);--rkm-muted:var(--color-text-muted,#66625a);
    --rkm-stone:var(--color-stone,#807b70);--rkm-sage:var(--color-soft-sage,#a9b39a);
    --rkm-forest-card:var(--color-forest-card,#213d30);--rkm-ease:var(--ease-out,cubic-bezier(.22,1,.36,1));
    --rkm-fast:var(--duration-fast,180ms)}
  #rkm-chat-btn,#rkm-chat,#rkm-chat *{box-sizing:border-box}
  #rkm-chat-btn svg,#rkm-chat svg{display:block;width:20px;height:20px;flex:none;fill:none;stroke:currentColor;
    stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
  #rkm-chat-btn{position:fixed;right:20px;bottom:20px;z-index:30;display:grid;place-items:center;width:56px;height:56px;
    padding:0;border:2px solid var(--rkm-parchment);border-radius:50%;background:var(--rkm-forest);color:var(--rkm-parchment);
    cursor:pointer;box-shadow:0 10px 28px rgb(16 32 25 / .28);
    transition:background-color var(--rkm-fast) var(--rkm-ease),transform var(--rkm-fast) var(--rkm-ease)}
  #rkm-chat-btn svg{width:24px;height:24px}
  #rkm-chat-btn:hover{background:var(--rkm-forest-card)}
  #rkm-chat-btn:active{transform:translateY(1px)}
  #rkm-chat-btn:focus-visible{outline:3px solid var(--rkm-accent);outline-offset:3px}
  #rkm-chat{position:fixed;right:20px;bottom:88px;z-index:30;width:min(380px,calc(100vw - 32px));
    height:min(560px,calc(100vh - 112px));height:min(560px,calc(100dvh - 112px));
    display:none;flex-direction:column;background:var(--rkm-ivory);color:var(--rkm-ink);
    border:1px solid var(--rkm-border);border-radius:16px;overflow:hidden;box-shadow:0 18px 48px rgb(30 33 27 / .22);
    font:14px/1.5 var(--font-sans,Manrope,Arial,sans-serif);text-align:left}
  #rkm-chat.open{display:flex}
  #rkm-chat button,#rkm-chat select,#rkm-chat input{font-family:inherit;margin:0}
  #rkm-chat :focus-visible{outline:2px solid var(--rkm-accent);outline-offset:2px}
  #rkm-chat header{padding:6px 6px 6px 16px;background:var(--rkm-forest);color:var(--rkm-parchment);display:flex;
    justify-content:space-between;align-items:center;gap:4px}
  #rkm-chat header strong{flex:1;min-width:0;font:400 17px/1.2 var(--font-display,Georgia,serif);letter-spacing:.01em;
    white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  #rkm-chat header button{display:grid;place-items:center;width:44px;height:44px;padding:0;border:0;border-radius:8px;
    background:transparent;color:var(--rkm-parchment);cursor:pointer;transition:background-color var(--rkm-fast) var(--rkm-ease)}
  #rkm-chat header button:hover{background:var(--rkm-forest-card)}
  #rkm-chat header :focus-visible{outline-color:var(--rkm-parchment);outline-offset:-2px}
  #rkm-voice[aria-pressed="true"]{background:var(--rkm-forest-card)}
  #rkm-lang{height:36px;min-height:36px;padding:0 6px;border:1px solid var(--rkm-sage);border-radius:8px;
    background:var(--rkm-forest-card);color:var(--rkm-parchment);font-size:13px;cursor:pointer;max-width:96px}
  #rkm-log{flex:1;overflow-y:auto;overscroll-behavior:contain;padding:14px;display:flex;flex-direction:column;gap:8px}
  .rkm-msg{max-width:85%;padding:9px 13px;border-radius:14px;white-space:pre-wrap;word-wrap:break-word;overflow-wrap:anywhere}
  .rkm-bot{background:var(--rkm-linen);color:var(--rkm-ink);align-self:flex-start;border-bottom-left-radius:4px}
  .rkm-user{background:var(--rkm-forest);color:var(--rkm-parchment);align-self:flex-end;border-bottom-right-radius:4px}
  .rkm-msg a{color:inherit;text-decoration:underline;text-underline-offset:2px}
  .rkm-bot a{text-decoration-color:var(--rkm-accent-strong)}
  #rkm-chips{display:flex;gap:6px;flex-wrap:wrap;padding:0 14px 10px}
  #rkm-chips button{display:inline-flex;align-items:center;gap:6px;min-height:44px;padding:0 14px;
    border:1px solid var(--rkm-border);border-radius:999px;background:var(--rkm-ivory);color:var(--rkm-ink);
    font-size:13px;font-weight:500;cursor:pointer;
    transition:border-color var(--rkm-fast) var(--rkm-ease),background-color var(--rkm-fast) var(--rkm-ease)}
  #rkm-chips button svg{width:16px;height:16px;color:var(--rkm-accent-strong)}
  #rkm-chips button:hover{border-color:var(--rkm-accent);background:var(--rkm-linen)}
  #rkm-form{display:flex;align-items:center;gap:4px;padding:6px;border-top:1px solid var(--rkm-border);background:var(--rkm-ivory)}
  #rkm-form input{flex:1;min-width:0;height:44px;padding:0 10px;border:1px solid transparent;border-radius:10px;
    background:transparent;color:var(--rkm-ink);font-size:16px}
  #rkm-form input::placeholder{color:var(--rkm-muted);opacity:1}
  #rkm-form input:focus{outline:none}
  #rkm-form input:focus-visible{outline:2px solid var(--rkm-accent);outline-offset:0;border-color:transparent}
  #rkm-form button{display:inline-grid;place-items:center;height:44px;min-width:44px;padding:0 16px;border:0;border-radius:10px;
    background:var(--rkm-accent-strong);color:var(--rkm-ivory);font-size:14px;font-weight:600;cursor:pointer;
    transition:background-color var(--rkm-fast) var(--rkm-ease),color var(--rkm-fast) var(--rkm-ease)}
  #rkm-form button[type=submit]:hover{background:var(--rkm-forest)}
  #rkm-mic{padding:0!important;width:44px;background:transparent!important;color:var(--rkm-forest)!important;
    border:1px solid var(--rkm-border)!important}
  #rkm-mic:hover{border-color:var(--rkm-accent)!important;color:var(--rkm-accent-strong)!important}
  #rkm-mic.on{background:var(--rkm-accent-strong)!important;border-color:var(--rkm-accent-strong)!important;
    color:var(--rkm-ivory)!important;animation:rkm-pulse 1.2s ease-in-out infinite}
  @keyframes rkm-pulse{50%{box-shadow:0 0 0 6px rgb(198 91 50 / .25)}}
  #rkm-chat [hidden]{display:none!important}
  #rkm-talk{padding:0!important;width:44px;background:var(--rkm-forest)!important;color:var(--rkm-parchment)!important}
  #rkm-talk:hover{background:var(--rkm-forest-card)!important}
  #rkm-live{display:flex;align-items:center;gap:10px;padding:6px 6px 6px 16px;border-top:1px solid var(--rkm-border);background:var(--rkm-ivory)}
  #rkm-live-dot{flex:none;width:12px;height:12px;border-radius:50%;background:var(--rkm-stone);
    transform:scale(calc(1 + var(--rkm-level,0)));transition:transform 80ms linear}
  #rkm-live[data-state=listening] #rkm-live-dot{background:var(--rkm-forest)}
  #rkm-live[data-state=speaking] #rkm-live-dot{background:var(--rkm-accent-strong);animation:rkm-pulse 1.2s ease-in-out infinite}
  #rkm-live-status{flex:1;min-width:0;font-size:13px;line-height:1.35;color:var(--rkm-ink)}
  #rkm-live-end{flex:none;height:44px;padding:0 16px;border:0;border-radius:10px;background:var(--rkm-accent-strong);
    color:var(--rkm-ivory);font-size:14px;font-weight:600;cursor:pointer;transition:background-color var(--rkm-fast) var(--rkm-ease)}
  #rkm-live-end:hover{background:var(--rkm-forest)}
  @media (max-width:420px){#rkm-chat-btn{right:16px;bottom:16px}#rkm-chat header{padding-left:12px;gap:2px}#rkm-chat header strong{font-size:15px}#rkm-lang{padding:0 2px;font-size:12px}#rkm-chat{right:16px;bottom:80px;height:min(560px,calc(100vh - 100px));height:min(560px,calc(100dvh - 100px))}}
  @media (prefers-reduced-motion:reduce){#rkm-chat-btn,#rkm-chat,#rkm-chat *{transition:none!important;animation:none!important}#rkm-live-dot{transform:none!important}}
  `;
  document.head.insertAdjacentHTML("beforeend", `<style>${css}</style>`);

  // Small inline SVG icons (decorative: the buttons carry aria-labels or text)
  const svg = (d) => `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${d}</svg>`;
  const ICONS = {
    chat: svg('<path d="M20 11.5a7.5 7.5 0 0 1-11.2 6.5L4 19.5l1.5-4.3A7.5 7.5 0 1 1 20 11.5Z"/><path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01" stroke-width="2.4"/>'),
    close: svg('<path d="M6 6l12 12M18 6 6 18"/>'),
    soundOn: svg('<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>'),
    soundOff: svg('<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="m16 9.5 5 5M21 9.5l-5 5"/>'),
    wave: svg('<path d="M4 10v4M8 7v10M12 4v16M16 7v10M20 10v4"/>'),
    mic: svg('<rect x="9" y="3.5" width="6" height="11" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v2.5"/>'),
    resume: svg('<path d="M14 3.5H7a1.5 1.5 0 0 0-1.5 1.5v14A1.5 1.5 0 0 0 7 20.5h10a1.5 1.5 0 0 0 1.5-1.5V8z"/><path d="M14 3.5V8h4.5M9 12.5h6M9 16h6"/>'),
    mail: svg('<rect x="3.5" y="5.5" width="17" height="13" rx="1.5"/><path d="m4 7 8 6 8-6"/>'),
    cart: svg('<path d="M3.5 4.5h2l2.2 10.2a1.5 1.5 0 0 0 1.5 1.2h7.6a1.5 1.5 0 0 0 1.5-1.1l1.6-6.3H6.3"/><circle cx="10" cy="19.5" r="1"/><circle cx="17" cy="19.5" r="1"/>'),
  };

  document.body.insertAdjacentHTML(
    "beforeend",
    `<button id="rkm-chat-btn" aria-label="Chat with Rohit's assistant" aria-controls="rkm-chat" aria-expanded="false">${ICONS.chat}</button>
     <div id="rkm-chat" role="dialog" aria-label="Chat with Rohit's assistant">
       <header>
         <strong>Ask about Rohit</strong>
         <select id="rkm-lang" aria-label="Language">
           <option value="en-IN">English</option>
           <option value="hi-IN">हिन्दी</option>
           <option value="kn-IN">ಕನ್ನಡ</option>
           <option value="bn-IN">বাংলা</option>
         </select>
         <button id="rkm-voice" aria-label="Read answers aloud" title="Read answers aloud" aria-pressed="false">${ICONS.soundOff}</button>
         <button id="rkm-close" aria-label="Close">${ICONS.close}</button>
       </header>
       <div id="rkm-log" aria-live="polite"></div>
       <div id="rkm-chips">
         <button data-q="Can I download Rohit's resume?">${ICONS.resume}Resume</button>
         <button data-q="How can I contact Rohit?">${ICONS.mail}Contact</button>
         <button data-q="What is Rohit's Shopify experience?">${ICONS.cart}Shopify experience</button>
       </div>
       <form id="rkm-form">
         <input maxlength="800" placeholder="Type or tap the mic…" aria-label="Message"/>
         <button type="button" id="rkm-mic" aria-label="Speak your question" title="Speak your question">${ICONS.mic}</button>
         <button type="button" id="rkm-talk" aria-label="Start a voice conversation" title="Voice conversation: English, हिन्दी, ಕನ್ನಡ, বাংলা" aria-pressed="false">${ICONS.wave}</button>
         <button type="submit">Send</button>
       </form>
       <div id="rkm-live" hidden>
         <span id="rkm-live-dot" aria-hidden="true"></span>
         <span id="rkm-live-status" role="status"></span>
         <button type="button" id="rkm-live-end">End call</button>
       </div>
     </div>`
  );

  const panel = document.getElementById("rkm-chat");
  const log = document.getElementById("rkm-log");
  const form = document.getElementById("rkm-form");
  const input = form.querySelector("input");
  const micBtn = document.getElementById("rkm-mic");
  const voiceBtn = document.getElementById("rkm-voice");
  const langSel = document.getElementById("rkm-lang");

  function setLang(l) {
    lang = l;
    langSel.value = l;
    if (recognition) recognition.lang = l;
    if (!recognizing) input.placeholder = SR ? LANGS[l].ph : "Type your question…";
  }
  langSel.onchange = () => { stopListening(); setLang(langSel.value); input.focus(); };

  // ---------- Panel ----------
  const launcher = document.getElementById("rkm-chat-btn");
  const toggle = () => {
    panel.classList.toggle("open");
    const open = panel.classList.contains("open");
    launcher.setAttribute("aria-expanded", String(open));
    if (open) input.focus();
    else {
      stopSpeaking(); stopListening(); endLive("user");
      if (panel.contains(document.activeElement)) launcher.focus(); // don't lose keyboard focus
    }
  };
  launcher.onclick = toggle;
  document.getElementById("rkm-close").onclick = toggle;
  // Esc closes the panel and returns focus to the launcher
  panel.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && panel.classList.contains("open")) { e.preventDefault(); toggle(); }
  });

  // ---------- Messages ----------
  const linkify = (t) =>
    t.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]))
     .replace(/(https?:\/\/[^\s)]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>')
     .replace(/([\w.+-]+@[\w-]+\.[\w.]+)/g, '<a href="mailto:$1">$1</a>');

  const add = (text, who) => {
    const el = document.createElement("div");
    el.className = `rkm-msg rkm-${who}`;
    el.innerHTML = linkify(text);
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
    return el;
  };

  add(GREETING, "bot");

  // ---------- Text-to-speech ----------
  // Find the best installed voice for a language ("hi-IN" also matches "hi_IN", "hi")
  const norm = (s) => s.toLowerCase().replace("_", "-");
  function findVoice(l) {
    const voices = speechSynthesis.getVoices();
    const code = l.toLowerCase(), base = code.split("-")[0];
    const good = (v) => /natural|google|neural|online/i.test(v.name);
    const exact = voices.filter((v) => norm(v.lang) === code);
    const loose = voices.filter((v) => norm(v.lang).split("-")[0] === base);
    return exact.find(good) || exact[0] || loose.find(good) || loose[0] || null;
  }
  if (canSpeak) speechSynthesis.getVoices(); // warm up the voice list
  const warnedNoVoice = {};

  // Make text sound natural: don't read URLs or emails letter by letter
  const forSpeech = (t, l) =>
    t.replace(/https?:\/\/\S*resume\.pdf\S*/gi, LANGS[l].resume)
     .replace(/https?:\/\/\S+/g, LANGS[l].link)
     .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, LANGS[l].email)
     .replace(/[*_#•]/g, "");

  function speak(text) {
    if (!canSpeak || !speakReplies) return;
    speechSynthesis.cancel();
    const l = detectLang(text) || "en-IN"; // Hinglish/English replies → Indian English voice
    const v = findVoice(l);
    if (!v && l !== "en-IN") {
      // No voice for this language on the device: don't let an English voice mangle it
      if (!warnedNoVoice[l]) {
        warnedNoVoice[l] = true;
        add(`(Your device doesn't have a ${LANGS[l].name} voice installed, so I'll reply in text for this language.)`, "bot");
      }
      return;
    }
    const u = new SpeechSynthesisUtterance(forSpeech(text, l));
    u.lang = l;
    if (v) u.voice = v;
    speechSynthesis.speak(u);
  }
  function stopSpeaking() { if (canSpeak) speechSynthesis.cancel(); }

  function setSpeak(on) {
    speakReplies = on && canSpeak;
    voiceBtn.innerHTML = speakReplies ? ICONS.soundOn : ICONS.soundOff;
    voiceBtn.setAttribute("aria-pressed", String(speakReplies));
    if (!speakReplies) stopSpeaking();
  }
  if (!canSpeak) voiceBtn.style.display = "none";
  voiceBtn.onclick = () => setSpeak(!speakReplies);

  // ---------- Speech-to-text ----------
  if (!SR) {
    micBtn.style.display = "none";
    input.placeholder = "Type your question…";
  } else {
    recognition = new SR();
    recognition.lang = lang;
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = (e) => {
      let text = "";
      for (const r of e.results) text += r[0].transcript;
      input.value = text;
      if (e.results[e.results.length - 1].isFinal) {
        stopListening();
        const v = input.value; input.value = "";
        send(v);
      }
    };
    recognition.onerror = (e) => {
      stopListening();
      if (e.error === "not-allowed" || e.error === "service-not-allowed")
        add("I couldn't access your microphone. Please allow mic access in your browser, or type your question.", "bot");
    };
    recognition.onend = () => stopListening();

    micBtn.onclick = () => (recognizing ? stopListening() : startListening());
  }

  function startListening() {
    stopSpeaking();
    setSpeak(true); // they're talking, so talk back
    try {
      recognition.start();
      recognizing = true;
      micBtn.classList.add("on");
      input.placeholder = LANGS[lang].listening;
    } catch { /* already started */ }
  }
  function stopListening() {
    if (!recognition) return;
    if (recognizing) { try { recognition.stop(); } catch {} }
    recognizing = false;
    micBtn.classList.remove("on");
    input.placeholder = LANGS[lang].ph;
  }

  // ---------- Chat ----------
  async function send(text) {
    text = text.trim();
    if (!text) return;
    stopSpeaking();
    const typed = detectLang(text);
    if (typed && typed !== lang) setLang(typed); // typed in Hindi/Kannada/Bengali → mic follows
    add(text, "user");
    history.push({ role: "user", text });
    const typing = add("…", "bot");
    let reply;
    try {
      const r = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      ({ reply } = await r.json());
      history.push({ role: "assistant", text: reply });
    } catch {
      reply = `Sorry, something went wrong. You can download the resume at ${RESUME_URL} or email ${EMAIL}.`;
    }
    typing.innerHTML = linkify(reply);
    log.scrollTop = log.scrollHeight;
    speak(reply);
  }

  // ---------- Live voice conversation (Gemini Live) ----------
  const LIVE_TOKEN_URL = API_URL + "/live-token";
  const LIVE_WS = "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContentConstrained";
  const LIVE_MODEL = "models/gemini-3.8-live"; // the token's locked setup wins; this just mirrors it
  const LIVE_MAX_MS = 5 * 60 * 1000; // keep calls (and Gemini audio costs) short
  const LIVE_STATUS = {
    connecting: "Connecting…",
    listening: "Listening. Speak in English, हिन्दी, ಕನ್ನಡ or বাংলা",
    speaking: "Speaking. Talk any time to interrupt",
  };
  const LIVE_END = {
    failed: `Sorry, I couldn't start the voice conversation. You can still type, or download the resume at ${RESUME_URL} or email ${EMAIL}.`,
    mic: "I couldn't access your microphone. Please allow mic access in your browser, or type your question.",
    ended: "The voice call ended. Tap the waveform button to start another, or keep typing.",
    limit: "That's the end of the voice call (5-minute limit). Tap the waveform button to start another, or keep typing.",
  };
  const talkBtn = document.getElementById("rkm-talk");
  const liveBar = document.getElementById("rkm-live");
  const liveStatus = document.getElementById("rkm-live-status");
  const chipsBox = document.getElementById("rkm-chips");
  const canTalk = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.AudioWorkletNode && window.WebSocket && window.isSecureContext);
  if (!canTalk) talkBtn.style.display = "none";
  let live = null; // the current call, or null

  // Runs in the audio thread: downsamples the mic to 16 kHz, 16-bit PCM, 100 ms chunks.
  const WORKLET = `
  class RkmMic extends AudioWorkletProcessor {
    constructor() { super(); this.ratio = sampleRate / 16000; this.pos = 0; this.buf = new Int16Array(1600); this.n = 0; }
    process(inputs) {
      const ch = inputs[0] && inputs[0][0];
      if (ch) {
        for (; this.pos < ch.length; this.pos += this.ratio) {
          const i = Math.floor(this.pos), f = this.pos - i, a = ch[i], b = i + 1 < ch.length ? ch[i + 1] : a;
          const v = Math.max(-1, Math.min(1, a + (b - a) * f));
          this.buf[this.n++] = v < 0 ? v * 0x8000 : v * 0x7fff;
          if (this.n === this.buf.length) { this.port.postMessage(this.buf.buffer, [this.buf.buffer]); this.buf = new Int16Array(1600); this.n = 0; }
        }
        this.pos -= ch.length;
      }
      return true;
    }
  }
  registerProcessor("rkm-mic", RkmMic);`;

  const toB64 = (buf) => {
    const u = new Uint8Array(buf);
    let s = "";
    for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000));
    return btoa(s);
  };
  const fromB64 = (b64) => {
    const s = atob(b64), u = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i);
    return u.buffer;
  };

  function setLiveState(s, state) {
    if (live !== s || s.state === state) return;
    s.state = state;
    liveBar.dataset.state = state;
    liveStatus.textContent = LIVE_STATUS[state];
  }

  function showLive(on) {
    const hadFocus = liveBar.contains(document.activeElement);
    form.hidden = on;
    chipsBox.hidden = on;
    liveBar.hidden = !on;
    talkBtn.setAttribute("aria-pressed", String(on));
    if (on) document.getElementById("rkm-live-end").focus();
    else {
      liveBar.style.removeProperty("--rkm-level");
      if (hadFocus && panel.classList.contains("open")) talkBtn.focus();
    }
  }

  // Gemini sends 24 kHz 16-bit PCM; queue the chunks back to back.
  function playPcm(s, buf) {
    const pcm = new Int16Array(buf, 0, buf.byteLength >> 1);
    if (!pcm.length) return;
    const f = new Float32Array(pcm.length);
    for (let i = 0; i < pcm.length; i++) f[i] = pcm[i] / 32768;
    const ab = s.ctx.createBuffer(1, f.length, 24000);
    ab.copyToChannel(f, 0);
    const src = s.ctx.createBufferSource();
    src.buffer = ab;
    src.connect(s.ctx.destination);
    const at = Math.max(s.ctx.currentTime + 0.03, s.playAt);
    src.start(at);
    s.playAt = at + ab.duration;
    s.sources.add(src);
    src.onended = () => { s.sources.delete(src); if (!s.sources.size) setLiveState(s, "listening"); };
    setLiveState(s, "speaking");
  }
  function stopPlayback(s) {
    for (const src of s.sources) { try { src.stop(); } catch { /* already stopped */ } }
    s.sources.clear();
    s.playAt = 0;
  }

  // Both sides' words arrive in pieces; build one bubble per side per turn.
  function addLiveText(s, who, t) {
    const key = who === "user" ? "curUser" : "curBot";
    let cur = s[key];
    if (!cur) {
      cur = s[key] = { text: "", el: document.createElement("div") };
      cur.el.className = `rkm-msg rkm-${who}`;
      // the visitor's words can arrive after the reply has started
      if (who === "user" && s.curBot) log.insertBefore(cur.el, s.curBot.el);
      else log.appendChild(cur.el);
    }
    cur.text += t;
    cur.el.innerHTML = linkify(cur.text.trim());
    log.scrollTop = log.scrollHeight;
  }
  function finishTurn(s) {
    // keep the transcript in the text history so typing afterwards has context
    if (s.curUser && s.curUser.text.trim()) history.push({ role: "user", text: s.curUser.text.trim() });
    if (s.curBot && s.curBot.text.trim()) history.push({ role: "assistant", text: s.curBot.text.trim() });
    s.curUser = s.curBot = null;
  }

  // Gemini guesses the language from the voice, and close languages (Bengali and Hindi) can be
  // mistaken for each other. When the visitor has picked a language in the menu, say so up front
  // (context only: turnComplete false doesn't trigger a reply).
  function sendLangHint(s) {
    if (lang === "en-IN" || !s.ready || s.ws.readyState !== 1) return;
    const name = `${LANGS[lang].name} (${{ "hi-IN": "Hindi", "kn-IN": "Kannada", "bn-IN": "Bengali" }[lang]})`;
    s.ws.send(JSON.stringify({ clientContent: { turns: [{ role: "user", parts: [{ text:
      `(The visitor chose ${name} in the chat's language menu. Speak ${name} with them unless they clearly use another language.)` }] }], turnComplete: false } }));
  }
  langSel.addEventListener("change", () => { if (live) sendLangHint(live); });

  async function onLiveMessage(s, ev) {
    let msg;
    try { msg = JSON.parse(typeof ev.data === "string" ? ev.data : await ev.data.text()); } catch { return; }
    if (live !== s) return;
    if (msg.setupComplete) { s.ready = true; sendLangHint(s); setLiveState(s, "listening"); return; }
    const sc = msg.serverContent;
    if (!sc) return;
    if (sc.interrupted) { stopPlayback(s); finishTurn(s); setLiveState(s, "listening"); }
    if (sc.inputTranscription && sc.inputTranscription.text) addLiveText(s, "user", sc.inputTranscription.text);
    if (sc.modelTurn && sc.modelTurn.parts) {
      for (const p of sc.modelTurn.parts) {
        const d = p.inlineData;
        if (d && d.data && (!d.mimeType || d.mimeType.startsWith("audio/"))) playPcm(s, fromB64(d.data));
      }
    }
    if (sc.outputTranscription && sc.outputTranscription.text) addLiveText(s, "bot", sc.outputTranscription.text);
    if (sc.turnComplete) finishTurn(s);
  }

  async function startLive() {
    if (live || !canTalk) return;
    stopSpeaking();
    stopListening();
    const s = (live = { ws: null, ctx: null, stream: null, sources: new Set(), playAt: 0, curUser: null, curBot: null, ready: false, state: "", timer: 0 });
    showLive(true);
    setLiveState(s, "connecting");
    let stage = "failed";
    try {
      // Created inside the click so the browser lets it play sound.
      s.ctx = new AudioContext();
      s.ctx.resume();
      const mod = URL.createObjectURL(new Blob([WORKLET], { type: "text/javascript" }));
      const micP = navigator.mediaDevices
        .getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 } })
        .catch((e) => { stage = "mic"; throw e; });
      // If the call ends while the mic is still being granted, release it straight away.
      micP.then((st) => { if (live !== s) st.getTracks().forEach((t) => t.stop()); else s.stream = st; }, () => {});
      const tokenP = fetch(LIVE_TOKEN_URL, { method: "POST" })
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`token ${r.status}`))))
        .then((d) => d.token || Promise.reject(new Error("no token")));
      const [stream, token] = await Promise.all([micP, tokenP, s.ctx.audioWorklet.addModule(mod)]);
      URL.revokeObjectURL(mod);
      if (live !== s) return; // ended while connecting

      const ws = (s.ws = new WebSocket(`${LIVE_WS}?access_token=${encodeURIComponent(token)}`));
      ws.onopen = () =>
        ws.send(JSON.stringify({ setup: { model: LIVE_MODEL, generationConfig: { responseModalities: ["AUDIO"] }, inputAudioTranscription: {}, outputAudioTranscription: {} } }));
      ws.onmessage = (ev) => onLiveMessage(s, ev);
      ws.onclose = () => { if (live === s) endLive(s.ready ? "ended" : "failed"); };

      const node = new AudioWorkletNode(s.ctx, "rkm-mic");
      const mute = s.ctx.createGain();
      mute.gain.value = 0; // keeps the worklet running without playing the mic back
      s.ctx.createMediaStreamSource(stream).connect(node).connect(mute).connect(s.ctx.destination);
      node.port.onmessage = (e) => {
        if (!s.ready || ws.readyState !== 1) return;
        ws.send(JSON.stringify({ realtimeInput: { audio: { data: toB64(e.data), mimeType: "audio/pcm;rate=16000" } } }));
        const pcm = new Int16Array(e.data);
        let sum = 0;
        for (let i = 0; i < pcm.length; i += 4) sum += pcm[i] * pcm[i];
        const rms = Math.sqrt(sum / Math.ceil(pcm.length / 4)) / 32768;
        liveBar.style.setProperty("--rkm-level", Math.min(0.8, rms * 6).toFixed(2));
      };
      s.timer = setTimeout(() => endLive("limit"), LIVE_MAX_MS);
    } catch {
      if (live === s) endLive(stage);
    }
  }

  function endLive(reason) {
    const s = live;
    if (!s) return;
    live = null;
    clearTimeout(s.timer);
    finishTurn(s);
    if (s.ws && s.ws.readyState <= 1) { try { s.ws.close(); } catch { /* closing anyway */ } }
    if (s.ctx) stopPlayback(s);
    if (s.stream) s.stream.getTracks().forEach((t) => t.stop());
    if (s.ctx) s.ctx.close().catch(() => {});
    showLive(false);
    if (LIVE_END[reason]) add(LIVE_END[reason], "bot");
  }

  talkBtn.onclick = startLive;
  document.getElementById("rkm-live-end").onclick = () => endLive("user");

  form.onsubmit = (e) => {
    e.preventDefault();
    const v = input.value;
    input.value = "";
    send(v);
  };
  document.querySelectorAll("#rkm-chips button").forEach((b) => (b.onclick = () => send(b.dataset.q)));
})();
