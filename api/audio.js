// api/audio.js
import ytdl from "@distube/ytdl-core";

export default async function handler(req, res) {
  const { videoId } = req.query;
  if (!videoId) {
    res.status(400).json({ error: "videoId query parameter is required" });
    return;
  }

  const url = `https://www.youtube.com/watch?v=${videoId}`;

  // 1) Собираем ваши YouTube-куки из ENV и реальный браузерный UA
  const cookie = process.env.YTDL_COOKIES || "";
  const ua =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
    "AppleWebKit/537.36 (KHTML, like Gecko) " +
    "Chrome/117.0.0.0 Safari/537.36";

  const requestOptions = {
    headers: {
      cookie,
      "User-Agent": ua,
    },
  };

  // 2) Получаем информацию о видео с прокинутыми заголовками
  let info;
  try {
    info = await ytdl.getInfo(url, { requestOptions });
  } catch (err) {
    console.error("Failed to get video info:", err);
    res.status(500).json({ error: "Could not retrieve video info" });
    return;
  }

  // 3) Выбираем лучший аудио-формат
  const format = ytdl.chooseFormat(info.formats, { quality: "highestaudio" });
  if (!format || !format.url) {
    console.error("No suitable audio format found", info.formats);
    res.status(500).json({ error: "No audio format available" });
    return;
  }

  // 4) Устанавливаем CORS и MIME-тайп
  const [mime] = format.mimeType.split(";");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", mime);
  res.setHeader("Cache-Control", "public, max-age=86400");

  // 5) Стримим аудио, прокидывая те же requestOptions
  const stream = ytdl.downloadFromInfo(info, {
    format,
    requestOptions,
  });

  stream.on("error", (err) => {
    console.error("Stream error:", err);
    res.end();
  });

  stream.pipe(res);
}
