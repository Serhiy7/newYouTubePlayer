// src/lib/invidious.js

export const INSTANCES = (import.meta.env.VITE_INVIDIOUS_INSTANCES || "")
  .split(",")
  .filter(Boolean);

export const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)";

/**
 * Запрашивает /api/v1/videos/:id на всех инстансах параллельно
 * и возвращает первый успешный JSON-ответ.
 */
export async function fetchVideoInfo(videoId) {
  const calls = INSTANCES.map((base) =>
    fetch(`${base}/api/v1/videos/${videoId}`, {
      headers: { "User-Agent": UA },
    }).then((res) => {
      if (!res.ok) throw new Error(`${base} → ${res.status}`);
      return res.json();
    })
  );
  // ждём любую удачу или бросаем AggregateError
  return Promise.any(calls);
}
