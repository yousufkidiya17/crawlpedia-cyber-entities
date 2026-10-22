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
