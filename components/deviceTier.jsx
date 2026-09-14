const debugLog = (...args) => {
  if (process.env.NODE_ENV !== "production") console.log(...args);
};

export function detectDeviceTier() {
  if (typeof window === "undefined") return "mid";

  const cores = navigator.hardwareConcurrency ?? 2;
  const ram = navigator.deviceMemory ?? 4;

  let gpuScore = 1;
  let gpuLabel = "unknown";

  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (gl) {
      const ext = gl.getExtension("WEBGL_debug_renderer_info");
      if (ext) {
        gpuLabel = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL);
        const renderer = gpuLabel.toLowerCase();

        const adreno = renderer.match(/adreno[^0-9]+(\d+)/i);
        if (adreno && parseInt(adreno[1]) < 500) {
          console.log(`[DeviceTier] tier: low | GPU: ${gpuLabel} | cores: ${cores} | RAM: ${ram}GB | reason: low-end Adreno`);
          return "low";
        }

        if (/rtx|rx 6|rx 7|rx 5700|m[12] (pro|max|ultra)|a\d{4}|quadro/i.test(renderer))
          gpuScore = 2;
        else if (/intel (uhd 6[0-5]|hd [456]|hd graphics)|mali-[gt][0-9]+|adreno \(tm\) [0-9]+|adreno [0-9]{3}[^0-9]|powervr/i.test(renderer))
          gpuScore = 0;
      }
    }
  } catch (_) {}

  const conn = navigator.connection;
  const slowNetwork = conn && (conn.saveData || conn.effectiveType === "2g" || conn.effectiveType === "slow-2g");
  if (slowNetwork) {
    console.log(`[DeviceTier] tier: low | GPU: ${gpuLabel} | cores: ${cores} | RAM: ${ram}GB | reason: slow network`);
    return "low";
  }

  const score = cores + ram / 2 + gpuScore * 2;
  const tier = score >= 10 ? "high" : score >= 5 ? "mid" : "low";

  console.log(`[DeviceTier] tier: ${tier} | GPU: ${gpuLabel} | cores: ${cores} | RAM: ${ram}GB | score: ${score.toFixed(1)} (gpu=${gpuScore})`);

  return tier;
}