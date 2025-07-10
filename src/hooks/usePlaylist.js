// src/hooks/usePlaylist.js
import { useState, useCallback } from "react";

export function usePlaylist(initialList) {
  const [playlist, setPlaylist] = useState(initialList);
  const [idx, setIdx] = useState(0);

  const select = useCallback((i) => {
    setIdx(i);
  }, []);

  const next = useCallback(() => {
    setIdx((i) => (i + 1) % playlist.length);
  }, [playlist.length]);

  const prev = useCallback(() => {
    setIdx((i) => (i - 1 + playlist.length) % playlist.length);
  }, [playlist.length]);

  const search = useCallback(
    async (q) => {
      if (!q) {
        setPlaylist(initialList);
        setIdx(0);
        return;
      }
      // прямой вызов YouTube Data API (не безопасно в открытом фронтенде — либо уберите совсем)
      const url = new URL("https://www.googleapis.com/youtube/v3/search");
      url.searchParams.set("part", "snippet");
      url.searchParams.set("type", "video");
      url.searchParams.set("maxResults", "10");
      url.searchParams.set("q", q);
      url.searchParams.set("key", import.meta.env.VITE_YT_API_KEY);
      const json = await fetch(url).then((r) => r.json());
      if (json.items) {
        setPlaylist(json.items);
        setIdx(0);
      }
    },
    [initialList]
  );

  return { playlist, idx, select, next, prev, search };
}
