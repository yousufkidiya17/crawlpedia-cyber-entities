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
