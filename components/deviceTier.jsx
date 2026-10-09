const debugLog = (...args) => {
  if (process.env.NODE_ENV !== "production") console.log(...args);
};

const TIERS = ["low", "mid", "high"];
const OVERRIDE_KEY = "deviceTierOverride";

/*
 * Test switch: open the site with ?tier=low, ?tier=mid or ?tier=high to
 * pretend to be that kind of device. The choice is remembered for the
 * current tab (so reloads and in-site navigation keep it) until you open
 * ?tier=auto. It only changes what the visitor's own device does, so it is
 * safe to leave enabled, including on deployed preview builds.
 */
function getTierOverride() {
  try {
    const param = new URLSearchParams(window.location.search).get("tier");
    if (param === "auto") {
      sessionStorage.removeItem(OVERRIDE_KEY);
      return null;
    }
    if (TIERS.includes(param)) {
      sessionStorage.setItem(OVERRIDE_KEY, param);
      return param;
    }
    const stored = sessionStorage.getItem(OVERRIDE_KEY);
    return TIERS.includes(stored) ? stored : null;
  } catch (_) {
    return null; // storage blocked: fall back to real detection
  }
}

let cachedTier = null;

export function detectDeviceTier() {
  if (typeof window === "undefined") return "mid";

  // Checked before the cache so changing ?tier= always takes effect.
  const override = getTierOverride();
  if (override) {
    debugLog(`[DeviceTier] tier: ${override} | OVERRIDE (?tier=${override}, ?tier=auto to clear)`);
    return override;
  }

  if (cachedTier) return cachedTier;

  const done = (tier, detail) => {
    debugLog(`[DeviceTier] tier: ${tier} | ${detail}`);
    cachedTier = tier;
    return tier;
  };

  const cores = navigator.hardwareConcurrency ?? 2;
  const ram = navigator.deviceMemory ?? 4;

  let gpuScore = 1;
  let gpuLabel = "unknown";
  let gl = null;

  try {
    const canvas = document.createElement("canvas");
    // Recent three.js (r163+) is WebGL2-only, so probe for that first.
    gl =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");

    // No WebGL at all: the sphere can't run, whatever the specs say.
    if (!gl) return done("low", "no WebGL");

    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    if (ext) {
      gpuLabel = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL);
      const renderer = gpuLabel.toLowerCase();

      const adreno = renderer.match(/adreno[^0-9]+(\d+)/i);
      if (adreno && parseInt(adreno[1]) < 500)
        return done("low", `GPU: ${gpuLabel} | reason: low-end Adreno`);

      if (/rtx|rx 6|rx 7|rx 5700|m[12] (pro|max|ultra)|a\d{4}|quadro/i.test(renderer))
        gpuScore = 2;
      else if (/intel (uhd 6[0-5]|hd [456]|hd graphics)|mali-[gt][0-9]+|adreno \(tm\) [0-9]+|adreno [0-9]{3}[^0-9]|powervr/i.test(renderer))
        gpuScore = 0;
    }
  } catch (_) {
    return done("low", "WebGL probe threw");
  } finally {
    // Free the probe context so it doesn't count against the browser's
    // limit on live WebGL contexts (the real canvas needs one).
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  }

  const conn = navigator.connection;
  const slowNetwork =
    conn && (conn.saveData || conn.effectiveType === "2g" || conn.effectiveType === "slow-2g");
  if (slowNetwork)
    return done("low", `GPU: ${gpuLabel} | reason: slow network or data saver`);

  const score = cores + ram / 2 + gpuScore * 2;
  const tier = score >= 10 ? "high" : score >= 5 ? "mid" : "low";

  return done(
    tier,
    `GPU: ${gpuLabel} | cores: ${cores} | RAM: ${ram}GB | score: ${score.toFixed(1)} (gpu=${gpuScore})`
  );
}