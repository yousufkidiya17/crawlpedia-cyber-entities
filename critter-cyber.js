/* ==============================================================================
 * Crawlpedia Cybernetic Engine v5 — Autonomous Web Entity
 * Inspired by @GOGREEN_AI "Meet Crawlers"
 * Pure Vanilla JavaScript & HTML5 Canvas Overlay (Zero External Dependencies)
 * Runs natively on local demos and ANY live website via Extension or Bookmarklet
 * ============================================================================== */

(() => {
  if (window.__crawlpediaCyberActive) {
    if (window.__crawlpediaTerminate) {
      window.__crawlpediaTerminate();
    }
    return;
  }
  window.__crawlpediaCyberActive = true;

  // Configuration & Theme Palettes
  const PALETTES = {
    red:    { name: "NEON RED",    primary: "#ff003c", glow: "rgba(255, 0, 60, 0.85)",   dim: "rgba(255, 0, 60, 0.25)",   text: "#ff6685" },
    green:  { name: "CYBER GREEN", primary: "#00ff66", glow: "rgba(0, 255, 102, 0.85)", dim: "rgba(0, 255, 102, 0.25)", text: "#66ff99" },
    cyan:   { name: "HOLON CYAN",  primary: "#00f0ff", glow: "rgba(0, 240, 255, 0.85)", dim: "rgba(0, 240, 255, 0.25)", text: "#80f7ff" },
    amber:  { name: "SOLAR AMBER", primary: "#ffb700", glow: "rgba(255, 183, 0, 0.85)",  dim: "rgba(255, 183, 0, 0.25)",  text: "#ffd566" }
  };

  let currentPaletteKey = "red";
  let activeTheme = PALETTES[currentPaletteKey];
  let currentMode = "spider"; // "spider" | "centipede" | "rover"
  let paused = false;
  let glitchEnabled = true;
  let speedMultiplier = 1.0;
    // ==============================================================================
  // AI Jargon Decryptor & Real-time Lexicon Engine (Offline Builtin + Wiki REST API)
  // ==============================================================================
  const BUILTIN_LEXICON = {
    spider: { pos: "NOUN", phonetic: "/ˈspaɪ.dər/", text: "Eight-legged predatory arachnid that spins silk webs to catch prey." },
    spiders: { pos: "NOUN", phonetic: "/ˈspaɪ.dərz/", text: "Air-breathing predatory arachnids of the biological order Araneae." },
    arthropod: { pos: "NOUN", phonetic: "/ˈɑː.θrə.pɒd/", text: "Invertebrate animal with an exoskeleton, segmented body, and jointed limbs." },
    arthropods: { pos: "NOUN", phonetic: "/ˈɑː.θrə.pɒdz/", text: "Invertebrates with chitinous exoskeletons and articulated jointed appendages." },
    chelicerae: { pos: "NOUN", phonetic: "/kɪˈlɪs.ər.iː/", text: "Pair of appendages in front of the mouth in arachnids, bearing venom fangs." },
    fangs: { pos: "NOUN", phonetic: "/fæŋz/", text: "Sharp, hollow canine appendages used to inject predatory venom into prey." },
    venom: { pos: "NOUN", phonetic: "/ˈven.əm/", text: "Poisonous fluid secreted by animals and injected into prey or aggressors." },
    silk: { pos: "NOUN", phonetic: "/sɪlk/", text: "High-tensile protein fibre extruded from spinnerets to construct webs." },
    spinnerets: { pos: "NOUN", phonetic: "/ˌspɪn.əˈrets/", text: "Tubular organs in spiders that extrude coherent protein silk threads." },
    evolution: { pos: "NOUN", phonetic: "/ˌiː.vəˈluː.ʃən/", text: "Biological diversification through natural selection and genetic change." },
    species: { pos: "NOUN", phonetic: "/ˈspiː.ʃiːz/", text: "Principal biological classification unit of organisms capable of interbreeding." },
    organisms: { pos: "NOUN", phonetic: "/ˈɔː.ɡən.ɪ.zəmz/", text: "Individual animal, plant, or single-celled functional life forms." },
    predator: { pos: "NOUN", phonetic: "/ˈpred.ə.tər/", text: "Organism that naturally hunts, captures, and preys on other living organisms." },
    habitat: { pos: "NOUN", phonetic: "/ˈhæb.ɪ.tæt/", text: "The natural ecological territory or environment inhabited by a species." },
    anatomy: { pos: "NOUN", phonetic: "/əˈnæt.ə.mi/", text: "Branch of science concerned with the bodily structure of living organisms." },
    taxonomists: { pos: "NOUN", phonetic: "/tækˈsɒn.ə.mɪsts/", text: "Biologists who classify organisms into formal categories based on traits." },
    digital: { pos: "ADJ", phonetic: "/ˈdɪdʒ.ɪ.təl/", text: "Expressed in discrete numerical digits, especially binary computer data." },
    cybernetic: { pos: "ADJ", phonetic: "/ˌsaɪ.bəˈnet.ɪk/", text: "Automated control and communication systems in electronic machines." },
    autonomous: { pos: "ADJ", phonetic: "/ɔːˈtɒn.ə.məs/", text: "Acting independently with self-governing logic and zero human intervention." },
    crawlers: { pos: "NOUN", phonetic: "/ˈkrɔː.lərz/", text: "Automated agent programs that systematically explore and index web documents." }
  };

  const definitionCache = new Map();
  let currentDefinition = null; // { word, pos, text, phonetic, status }
  let definitionsEnabled = true;

  const fetchWordDefinition = async (rawWord) => {
    if (!definitionsEnabled || !rawWord) return;
    const clean = rawWord.toLowerCase().replace(/[^a-z]/g, "");
    if (clean.length < 3) return;

    // Check Memory Cache
    if (definitionCache.has(clean)) {
      currentDefinition = definitionCache.get(clean);
      return;
    }

    // Check Built-in Lexicon (Instant 0ms, Immune to CSP)
    if (BUILTIN_LEXICON[clean]) {
      const res = { word: clean, ...BUILTIN_LEXICON[clean], status: "ready" };
      definitionCache.set(clean, res);
      currentDefinition = res;
      return;
    }

    // Set immediate loading state
    currentDefinition = { word: clean, pos: "SCANNING", text: "Decrypting lexical definition from database...", phonetic: "", status: "loading" };

    // Try Wikipedia Summary API (Allowed by Wikipedia CSP)
    try {
      const wResp = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(clean)}`);
      if (wResp.ok) {
        const wData = await wResp.json();
        if (wData && wData.extract) {
          const res = {
            word: clean,
            pos: (wData.description || "LEXICON").toUpperCase().slice(0, 16),
            text: wData.extract.split(". ")[0] + ".",
            phonetic: "",
            status: "ready"
          };
          definitionCache.set(clean, res);
          currentDefinition = res;
          return;
        }
      }
    } catch (_) {}

    // Try Free Dictionary API
    try {
      const dResp = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${clean}`);
      if (dResp.ok) {
        const dData = await dResp.json();
        if (dData && dData[0] && dData[0].meanings && dData[0].meanings[0]) {
          const m = dData[0].meanings[0];
          const pos = (m.partOfSpeech || "noun").toUpperCase();
          const def = m.definitions && m.definitions[0] ? m.definitions[0].definition : "Definition verified.";
          const phonetic = dData[0].phonetic || "";
          const res = {
            word: clean,
            pos,
            text: def,
            phonetic,
            status: "ready"
          };
          definitionCache.set(clean, res);
          currentDefinition = res;
          return;
        }
      }
    } catch (_) {}

    // Clean Fallback for rare words
    const fallback = {
      word: clean,
      pos: "TOKEN",
      text: "Validated structural semantic token within active webpage document context.",
      phonetic: "",
      status: "ready"
    };
    definitionCache.set(clean, fallback);
    currentDefinition = fallback;
  };

  // ==============================================================================
  // Procedural Cybernetic Audio Synthesizer (Web Audio API - Zero External Assets)
  // Synthesizes the exact mechanical scuttle, radar pings, and matrix glitch chirps
  // ==============================================================================
  let audioCtx = null;
  let soundEnabled = true;
  let lastStepSoundTime = 0;

  // ==============================================================================
  // Multi-Layer Vibration & Haptic Engine
  // 1. Hardware Haptic Motor (navigator.vibrate)
  // 2. Sub-Bass Acoustic Rumble (50Hz speaker/earcup vibration)
  // 3. Visual Micro Screen-Shake (Tactile impact jitter)
  // ==============================================================================
  let screenShake = 0; // Screen jitter magnitude

  const triggerHaptic = (pattern) => {
    if (navigator && navigator.vibrate) {
      try { navigator.vibrate(pattern); } catch (_) {}
    }
  };

  const playSubBassThud = (vol = 0.18, freq = 55, dur = 0.09) => {
    if (!soundEnabled || !audioCtx || audioCtx.state !== "running") return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(28, now + dur);

    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + dur + 0.01);
  };


  // ==============================================================================
  // Footstep Electric Arc Sparks & Contact Shockwave Rings
  // Generates sparks & ripples whenever legs step down onto text words
  // ==============================================================================
  const footstepSparks = [];  // { x, y, vx, vy, life, maxLife, color }
  const footstepRipples = []; // { x, y, r, maxR, alpha }

  const triggerFootstepContact = (x, y) => {
    playLegClick(1.0);
    // Shockwave contact ripples
    if (footstepRipples.length < 16) {
      footstepRipples.push({ x, y, r: 2, maxR: 24, alpha: 0.85 });
    }
    // High-voltage electric arc sparks
    if (footstepSparks.length < 40) {
      for (let i = 0; i < 4; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = 60 + Math.random() * 140;
        footstepSparks.push({
          x,
          y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd - 35,
          life: 0.22 + Math.random() * 0.12,
          maxLife: 0.34,
          color: Math.random() > 0.4 ? activeTheme.primary : "#ffffff"
        });
      }
    }
  };


  const initAudio = () => {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) {
        audioCtx = new AudioCtxClass();
      }
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume();
    }
  };

  // 1. Mechanical Leg Scuttle Click (High-frequency tactile click)
  const playLegClick = (vol = 1.0) => {
    if (!soundEnabled || !audioCtx || audioCtx.state !== "running") return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "triangle";
    const freq = 1800 + Math.random() * 1200;
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(250, now + 0.018);

    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.018);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.02);
  };

  // 2. Matrix Text Decrypt / Glitch Chatter (High-tech FM data chirps)
  const playGlitchChirp = (vol = 1.0) => {
    if (!soundEnabled || !audioCtx || audioCtx.state !== "running") return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = Math.random() > 0.4 ? "sawtooth" : "square";
    const baseF = 1400 + Math.random() * 2600;
    osc.frequency.setValueAtTime(baseF, now);
    osc.frequency.exponentialRampToValueAtTime(baseF * (0.5 + Math.random() * 0.9), now + 0.024);

    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.024);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.026);
  };

  // 3. Sonar Radar Pulse Ping
  const playRadarPing = (vol = 1.0) => {
    if (!soundEnabled || !audioCtx || audioCtx.state !== "running") return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(1600, now);
    osc.frequency.exponentialRampToValueAtTime(700, now + 0.14);

    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  };

  // 4. Target Locked Beep
  const playTargetLocked = (vol = 1.0) => {
    if (!soundEnabled || !audioCtx || audioCtx.state !== "running") return;
    const now = audioCtx.currentTime;
    [2400, 3400].forEach((f, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const st = now + i * 0.045;

      osc.type = "sine";
      osc.frequency.setValueAtTime(f, st);

      gain.gain.setValueAtTime(vol, st);
      gain.gain.exponentialRampToValueAtTime(0.0001, st + 0.04);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(st);
      osc.stop(st + 0.045);
    });
  };


  // Create High-DPI Fullscreen Canvas Overlay (pointer-events: none so live page remains 100% interactive)
  const canvas = document.createElement("canvas");
  canvas.id = "__crawlpedia_canvas";
  canvas.style.cssText = "position:fixed;inset:0;width:100vw;height:100vh;z-index:2147483645;pointer-events:none;background:transparent;";
  (document.body || document.documentElement).appendChild(canvas);
  const ctx = canvas.getContext("2d");

  const resizeCanvas = () => {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  // Safe Element Filter for Live Websites (protects forms, inputs, scripts, modals)
  const isSafeElement = el => el && !el.closest("input,textarea,select,[contenteditable],[contenteditable=\"true\"],script,style,noscript,canvas,iframe,#__crawlpedia_hud");

  // Sub-pixel DOM Text Word Harvesting using standard Range API
  
  // ==============================================================================
  // "Set-of-Mark" (SoM) Interactive Target Radar Scanner
  // Scans visible buttons, search inputs, and links & assigns numbered badges [ 01 ]
  // ==============================================================================
  let interactiveTargets = []; // { id, badge, el, type, label, x, y, w, h }
  let radarEnabled = true;

  const scanInteractiveTargets = () => {
    if (!radarEnabled || !document.body) {
      interactiveTargets = [];
      return;
    }

    const candidates = document.querySelectorAll("button, input, textarea, select, [role='button'], [role='link'], a[href]");
    const visibleList = [];

    candidates.forEach(el => {
      if (!isSafeElement(el)) return;
      if (el.closest("#__crawlpedia_hud")) return;

      const rect = el.getBoundingClientRect();
      // Must be visible in reasonable viewport
      if (rect.width < 14 || rect.height < 10) return;
      if (rect.bottom < -50 || rect.top > window.innerHeight + 50) return;

      const style = window.getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") return;

      // Extract Clean Label
      let type = "ACTION";
      const tag = el.tagName.toLowerCase();
      if (tag === "input" || tag === "textarea") {
        type = "INPUT";
      } else if (tag === "button" || el.getAttribute("role") === "button") {
        type = "BUTTON";
      } else if (tag === "a") {
        type = "LINK";
      }

      let label = (el.innerText || el.placeholder || el.getAttribute("aria-label") || el.title || el.name || el.value || "").trim();
      label = label.replace(/[\r\n\t]+/g, " ").slice(0, 16);
      if (!label && type === "INPUT") label = "Search/Text";
      if (!label) label = type;

      visibleList.push({
        el,
        type,
        label,
        x: rect.left + window.scrollX + rect.width * 0.5,
        y: rect.top + window.scrollY + rect.height * 0.5,
        w: rect.width,
        h: rect.height,
        screenX: rect.left,
        screenY: rect.top
      });
    });

    // Sort by screen position (top to bottom) & assign top 16 badges
    visibleList.sort((a, b) => (a.screenY - b.screenY) || (a.screenX - b.screenX));
    interactiveTargets = visibleList.slice(0, 16).map((item, idx) => ({
      ...item,
      id: idx + 1,
      badge: `0${idx + 1}`.slice(-2)
    }));
  };
  scanInteractiveTargets();



  let harvestedWords = [];
  const harvestWords = () => {
    harvestedWords = [];
    if (!document.body) return;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node;
    const range = document.createRange();
    while ((node = walker.nextNode()) && harvestedWords.length < 1200) {
      const text = node.textContent;
      if (!/[A-Za-z0-9]{4,}/.test(text)) continue;
      const parent = node.parentElement;
      if (!isSafeElement(parent)) continue;

      const matches = [...text.matchAll(/[A-Za-z][A-Za-z0-9'-]{3,}/g)];
      for (const m of matches.slice(0, 4)) {
        try {
          range.setStart(node, m.index);
          range.setEnd(node, m.index + m[0].length);
          const rect = range.getBoundingClientRect();
          if (rect.width < 12 || rect.height < 6) continue;
          harvestedWords.push({
            node,
            parent,
            word: m[0],
            charIndex: m.index,
            x: rect.left + window.scrollX + rect.width * 0.5,
            y: rect.top + window.scrollY + rect.height * 0.5,
            w: rect.width,
            h: rect.height
          });
        } catch (_) {}
      }
    }
  };
  harvestWords();

  let scrollTimeout = null;
  const onScroll = () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      harvestWords();
      scanInteractiveTargets();
    }, 200);
  };
  window.addEventListener("scroll", onScroll, { passive: true });

  // Matrix Text Decrypt / Glitch Engine
  const GLYPHS = "01#%&_§?*+~=X$Ø10987654321";
  const activeGlitches = new Map();

  const triggerWordGlitch = (w) => {
    if (!glitchEnabled || !w || !w.parent || !w.node || !w.node.isConnected || activeGlitches.has(w.parent)) return;
    const originalText = w.word;
    const nodeText = w.node.textContent || "";
    const idx = nodeText.indexOf(originalText);
    if (idx === -1) return;

    let iteration = 0;
    const maxIterations = 12;

    try {
      const beforeText = nodeText.slice(0, idx);
      const afterText = nodeText.slice(idx + originalText.length);

      const span = document.createElement("span");
      span.setAttribute("data-crawlpedia-glitch", "true");
      span.style.cssText = `
        color: ${activeTheme.primary} !important;
        text-shadow: 0 0 12px ${activeTheme.glow} !important;
        background: rgba(8, 12, 18, 0.88) !important;
        border: 1px solid ${activeTheme.primary} !important;
        border-radius: 4px !important;
        padding: 1px 5px !important;
        font-family: ui-monospace, SFMono-Regular, "Courier New", monospace !important;
        font-weight: bold !important;
        display: inline-block !important;
        transform: translateY(-6px) scale(1.18) !important;
        box-shadow: 0 6px 18px ${activeTheme.glow} !important;
        transition: transform 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
        z-index: 2147483646 !important;
      `;
      span.textContent = originalText;

      const parent = w.parent;
      const beforeNode = document.createTextNode(beforeText);
      const afterNode = document.createTextNode(afterText);

      parent.insertBefore(beforeNode, w.node);
      parent.insertBefore(span, w.node);
      parent.insertBefore(afterNode, w.node);
      w.node.remove();

      const interval = setInterval(() => {
        iteration++;
      playGlitchChirp();
        span.textContent = originalText.split("").map((char, index) => {
          if (index < (iteration / maxIterations) * originalText.length) {
            return originalText[index];
          }
          return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }).join("");

        if (iteration >= maxIterations) {
          clearInterval(interval);
          span.textContent = originalText;
          setTimeout(() => {
            if (span.parentNode) {
              span.replaceWith(document.createTextNode(originalText));
              try { parent.normalize(); } catch (_) {}
            }
            activeGlitches.delete(parent);
          }, 1000);
        }
      }, 25);

      activeGlitches.set(parent, interval);
    } catch (_) {}
  };

  // Creature State & Kinematics
  let pos = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.5 };
  let target = null;
  let angle = 0;
  let speed = 0;
  let state = "SCANNING"; // "SCANNING" | "HUNTING" | "DECRYPTING"
  let stateTimer = 0;
  let mousePos = { x: -999, y: -999 };
  let mouseActive = false;
  let lastFilamentAnchor = { x: -999, y: -999 };

  // Laser Filament Silk Lines with Traveling Data Packets (Surface Engine Architecture)
  const laserFilaments = []; // { docX, docY, word, born, packets: [] }

  // Radar Sweeps
  const radarWaves = []; // { x, y, r, alpha }

  // Centipede Chain
  const chainLength = 26;
  const chain = Array.from({ length: chainLength }, (_, i) => ({ x: pos.x - i * 14, y: pos.y, angle: 0 }));

  // Spider IK Legs
  const spiderLegs = [];
  for (const side of [-1, 1]) {
    for (let row = 0; row < 4; row++) {
      spiderLegs.push({
        side,
        row,
        fx: pos.x,
        fy: pos.y,
        lift: 0,
        wasLifting: false,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

    const getLegRest = (L) => {
    const forwardOffset = (1.5 - L.row) * 20;
    const lateralOffset = L.side * 26;
    const reach = L.row === 1 || L.row === 2 ? 150 : 130;
    const cos = Math.cos(angle), sin = Math.sin(angle);
    const ax = pos.x + cos * forwardOffset - sin * lateralOffset;
    const ay = pos.y + sin * forwardOffset + cos * lateralOffset;

    // PHYSICAL WORD CLAMPING / GRIPPING (From the Video):
    // When decrypting a word, front limbs actively reach out and pin/clamp onto the word boundaries!
    if (state === "DECRYPTING" && target && target.w && (L.row === 0 || L.row === 1)) {
      const wx = target.w.x - window.scrollX;
      const wy = target.w.y - window.scrollY;
      const halfW = Math.max(16, target.w.w * 0.5);
      const halfH = Math.max(8, target.w.h * 0.5);
      const gripPulse = Math.sin(telemetryFrame * 0.35) * 3;

      if (L.row === 0) {
        // Front Row Claws: Pin directly onto the left & right edges of the word
        return {
          ax, ay,
          tx: wx + L.side * (halfW + 4) + gripPulse * L.side,
          ty: wy + halfH * 0.2 + gripPulse * 0.5
        };
      } else if (L.row === 1) {
        // Row 1 Limbs: Brace top corners of the word
        return {
          ax, ay,
          tx: wx + L.side * (halfW * 0.7),
          ty: wy - halfH - 4 + gripPulse
        };
      }
    }

    const ox = -sin * L.side, oy = cos * L.side;
    return { ax, ay, tx: ax + ox * reach, ty: ay + oy * reach };
  };

  spiderLegs.forEach(L => {
    const r = getLegRest(L);
    L.fx = r.tx;
    L.fy = r.ty;
  });

  // Pick Next Word Target
  const pickTargetWord = () => {
    const visible = harvestedWords.filter(w => {
      const vx = w.x - window.scrollX;
      const vy = w.y - window.scrollY;
      return vx > 60 && vx < window.innerWidth - 60 && vy > 60 && vy < window.innerHeight - 60;
    });

    if (visible.length) {
      const choice = visible[Math.floor(Math.random() * visible.length)];
      target = { x: choice.x - window.scrollX, y: choice.y - window.scrollY, w: choice };
      state = "HUNTING";
      fetchWordDefinition(choice.word);
    } else {
      target = {
        x: 100 + Math.random() * (window.innerWidth - 200),
        y: 100 + Math.random() * (window.innerHeight - 200),
        w: null
      };
      state = "SCANNING";
    }
  };
  pickTargetWord();

  // Floating Cyber HUD Bar (Draggable, Collapsible, Clean UX)
  const hudContainer = document.createElement("div");
  hudContainer.id = "__crawlpedia_hud";
  hudContainer.style.cssText = `
    position: fixed; top: 16px; right: 18px; z-index: 2147483647;
    display: flex; gap: 6px; align-items: center;
    background: rgba(13, 17, 23, 0.94); border: 1px solid #30363d;
    padding: 6px 10px; border-radius: 8px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.85); backdrop-filter: blur(10px);
    font-family: ui-monospace, SFMono-Regular, "Courier New", monospace; font-size: 11px; color: #e6edf3;
    user-select: none;
  `;
  (document.body || document.documentElement).appendChild(hudContainer);

  // Drag handle
  const dragHandle = document.createElement("span");
  dragHandle.textContent = "⠿";
  dragHandle.title = "Drag HUD to Move";
  dragHandle.style.cssText = "cursor: grab; color: #8b949e; font-size: 14px; margin-right: 4px; padding: 2px;";
  hudContainer.appendChild(dragHandle);

  let isDraggingHud = false, dragOffset = { x: 0, y: 0 };
  dragHandle.addEventListener("mousedown", (e) => {
    isDraggingHud = true;
    dragOffset.x = e.clientX - hudContainer.getBoundingClientRect().left;
    dragOffset.y = e.clientY - hudContainer.getBoundingClientRect().top;
    dragHandle.style.cursor = "grabbing";
    e.preventDefault();
  });
  window.addEventListener("mousemove", (e) => {
    if (!isDraggingHud) return;
    hudContainer.style.left = `${Math.max(10, Math.min(window.innerWidth - 300, e.clientX - dragOffset.x))}px`;
    hudContainer.style.top = `${Math.max(10, Math.min(window.innerHeight - 60, e.clientY - dragOffset.y))}px`;
    hudContainer.style.right = "auto";
  });
  window.addEventListener("mouseup", () => {
    isDraggingHud = false;
    dragHandle.style.cursor = "grab";
  });

  const makeHudButton = (text, title, onClick) => {
    const btn = document.createElement("button");
    btn.textContent = text;
    btn.title = title;
    btn.style.cssText = `
      background: #21262d; border: 1px solid #30363d; color: #c9d1d9;
      padding: 4px 8px; border-radius: 4px; cursor: pointer;
      font-family: inherit; font-size: 10px; font-weight: bold;
      transition: all 0.15s ease;
    `;
    btn.onmouseenter = () => { btn.style.borderColor = activeTheme.primary; btn.style.color = "#fff"; };
    btn.onmouseleave = () => { btn.style.borderColor = "#30363d"; btn.style.color = "#c9d1d9"; };
    btn.addEventListener("click", (e) => { e.stopPropagation(); onClick(); });
    hudContainer.appendChild(btn);
    return btn;
  };

  const pauseBtn = makeHudButton("❚❚ PAUSE", "Pause or Resume Entity (Space)", () => {
    paused = !paused;
    pauseBtn.textContent = paused ? "▶ RUN" : "❚❚ PAUSE";
    pauseBtn.style.color = paused ? "#ff003c" : "#c9d1d9";
  });

  const modeBtn = makeHudButton("SPIDER", "Switch Crawler Entity (M)", () => {
    if (currentMode === "spider") currentMode = "centipede";
    else if (currentMode === "centipede") currentMode = "rover";
    else currentMode = "spider";

    modeBtn.textContent = currentMode.toUpperCase();
    chain.forEach((p, i) => { p.x = pos.x - i * 14; p.y = pos.y; });
  });

  const colorBtn = makeHudButton("RED", "Switch Neon Laser Palette (C)", () => {
    const keys = Object.keys(PALETTES);
    const nextIdx = (keys.indexOf(currentPaletteKey) + 1) % keys.length;
    currentPaletteKey = keys[nextIdx];
    activeTheme = PALETTES[currentPaletteKey];
    colorBtn.textContent = currentPaletteKey.toUpperCase();
    colorBtn.style.color = activeTheme.primary;
  });

  const speedBtn = makeHudButton("1x", "Speed Multiplier", () => {
    if (speedMultiplier === 1.0) speedMultiplier = 1.8;
    else if (speedMultiplier === 1.8) speedMultiplier = 0.6;
    else speedMultiplier = 1.0;
    speedBtn.textContent = `${speedMultiplier}x`;
  });

  
      const radarBtn = makeHudButton("RADAR: ON", "Toggle Set-of-Mark Interactive Targets (R)", () => {
    radarEnabled = !radarEnabled;
    scanInteractiveTargets();
    radarBtn.textContent = radarEnabled ? "RADAR: ON" : "RADAR: OFF";
    radarBtn.style.opacity = radarEnabled ? "1" : "0.5";
  });

  const defBtn = makeHudButton("DEF: ON", "Toggle AI Jargon Decryptor (D)", () => {
