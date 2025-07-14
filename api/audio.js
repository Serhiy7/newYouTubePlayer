// api/audio.js
import ytdl from "@distube/ytdl-core";

export default async function handler(req, res) {
  const { videoId } = req.query;
  if (!videoId) {
    res.status(400).json({ error: "videoId query parameter is required" });
    return;
  }

  const url = `https://www.youtube.com/watch?v=${videoId}`;

  let info;
  try {
    info = await ytdl.getInfo(url);
  } catch (err) {
    console.error("Failed to get video info:", err);
    res.status(500).json({ error: "Could not retrieve video info" });
    return;
  }

  // Выбираем лучший аудио-формат
  const format = ytdl.chooseFormat(info.formats, { quality: "highestaudio" });
  if (!format || !format.url) {
    console.error("No suitable audio format found", info.formats);
    res.status(500).json({ error: "No audio format available" });
    return;
  }

  // Устанавливаем заголовки CORS и типа контента
  const [mime] = format.mimeType.split(";");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", mime);
  res.setHeader("Cache-Control", "public, max-age=86400");

  // Запускаем стриминг аудио
  const stream = ytdl.downloadFromInfo(info, { format });

  stream.on("error", (err) => {
    console.error("Stream error:", err);
    res.end(); // завершение при ошибке
  });

  stream.pipe(res);
}

export const config = {
  runtime: "nodejs18.x",
};
