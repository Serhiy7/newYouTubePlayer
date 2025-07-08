// src/hooks/useAudioSync.js
import { useEffect } from "react";

export function useAudioSync({
  audioRef,
  visualizerRef,
  player,
  playing,
  idx,
  playlist,
}) {
  // 1) Меняем src и reload на смене трека
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = `/api/audio?videoId=${playlist[idx].id}`;
    audio.load();
  }, [idx, playlist, audioRef]);

  // 2) Play/Pause + синхронизация времени + init визуализатора
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
  }, [playing, idx, player, audioRef, visualizerRef, playlist]);
}
