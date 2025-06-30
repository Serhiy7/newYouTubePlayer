// api/search.js
export default async function handler(req, res) {
  const { q } = req.query;
  if (!q) {
    res.status(400).json({ error: "Missing q parameter" });
    return;
  }

  const KEY = process.env.YT_API_KEY;
  if (!KEY) {
    res
      .status(500)
      .json({ error: "Server misconfiguration: YT_API_KEY not set" });
    return;
  }

  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.searchParams.set("part", "snippet");
  url.searchParams.set("type", "video");
  url.searchParams.set("maxResults", "10");
  url.searchParams.set("q", q);
  url.searchParams.set("key", KEY);

  try {
    const ytRes = await fetch(url.toString());
    const data = await ytRes.json();
    if (!data.items) throw new Error("No items in response");

    const items = data.items.map((it) => ({
      id: it.id.videoId,
      title: it.snippet.title,
      artist: it.snippet.channelTitle,
    }));
    res.status(200).json({ items });
  } catch (err) {
    console.error("YT Search Error:", err);
    res.status(500).json({ error: "YouTube search failed" });
  }
}
