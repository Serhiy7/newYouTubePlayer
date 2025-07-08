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
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const json = await res.json();
      if (json.items) {
        setPlaylist(json.items);
        setIdx(0);
      }
    },
    [initialList]
  );

  return { playlist, idx, select, next, prev, search };
}
