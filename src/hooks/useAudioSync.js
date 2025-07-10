// src/hooks/useAudioSync.js
import { useEffect } from "react";
import { fetchVideoInfo } from "../lib/invidious";

export function useAudioSync({
  audioRef,
  visualizerRef,
  player,
  playing,
  idx,
  playlist,
}) {
  // 1) При смене трека — подгружаем URL из Invidious и reload
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    fetchVideoInfo(playlist[idx].id)
      .then((info) => {
        const fmt = info.adaptiveFormats.find((f) =>
          f.mimeType.startsWith("audio/")
        );
        if (!fmt?.url) throw new Error("No audio URL");
        audio.crossOrigin = "anonymous";
        audio.src = fmt.url;
        audio.load();
      })
      .catch(console.error);
  }, [idx, playlist, audioRef]);

  // 2) При play/pause — синхронизируем время и запускаем визуализатор
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !player) return;

    if (!playing) {
      player.pauseVideo();
      audio.pause();
      return;
    }
    player.playVideo();

    const syncAndStart = () => {
      const t = player.getCurrentTime();
      if (Number.isFinite(t)) {
        try {
          audio.currentTime = t;
        } catch {}
      }
      visualizerRef.current?.init();
      audio.play().catch(() => {});
    };

    if (audio.readyState >= 3) {
      syncAndStart();
    } else {
      audio.addEventListener("canplay", syncAndStart, { once: true });
    }
    return () => {
      audio.removeEventListener("canplay", syncAndStart);
    };
  }, [playing, idx, player, audioRef, visualizerRef]);
}
