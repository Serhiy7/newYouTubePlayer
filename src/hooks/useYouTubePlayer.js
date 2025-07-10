// src/hooks/useYouTubePlayer.js
import { useEffect, useRef } from "react";
import { YTReady } from "../lib/yt";

export function useYouTubePlayer({
  containerRef,
  videoId,
  volume,
  onProgress,
  onPlayerReady,
  onEnd,
  progressInterval = 500,
}) {
  const playerRef = useRef(null);
  const intervalRef = useRef(null);
  const onEndRef = useRef(onEnd);

  // обновляем callback onEnd без пересоздания плеера
  useEffect(() => {
    onEndRef.current = onEnd;
  }, [onEnd]);

  // формат времени mm:ss
  const fmt = (sec) => {
    const m = Math.floor(sec / 60);
    const s = String(Math.floor(sec % 60)).padStart(2, "0");
    return `${m}:${s}`;
  };

  // запускаем таймер прогресса
  const startProgress = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      const p = playerRef.current;
      if (!p?.getCurrentTime) return;
      const t = p.getCurrentTime();
      const d = p.getDuration();
      onProgress({
        currentTime: fmt(t),
        duration: fmt(d),
        percent: d ? Math.round((t / d) * 100) : 0,
      });
    }, progressInterval);
  };

  // монтирование и инициализация YouTube Player
  useEffect(() => {
    let cancelled = false;
    YTReady.then((YT) => {
      if (cancelled) return;
      playerRef.current = new YT.Player(containerRef.current, {
        host: "https://www.youtube-nocookie.com",
        videoId,
        playerVars: {
          controls: 0,
          disablekb: 1,
          modestbranding: 1,
          rel: 0,
          origin: window.location.origin,
        },
        events: {
          onReady: (e) => {
            e.target.setVolume(volume);
            onPlayerReady(e.target);
          },
          onStateChange: (e) => {
            if (e.data === YT.PlayerState.PLAYING) startProgress();
            else clearInterval(intervalRef.current);
            if (e.data === YT.PlayerState.ENDED) onEndRef.current();
          },
        },
      });
    });

    return () => {
      cancelled = true;
      clearInterval(intervalRef.current);
      playerRef.current?.destroy?.();
    };
  }, [containerRef, volume, onPlayerReady, progressInterval]);

  // при изменении videoId — грузим и стартуем
  useEffect(() => {
    const p = playerRef.current;
    if (p?.loadVideoById) {
      p.loadVideoById(videoId);
      p.playVideo();
    }
  }, [videoId]);

  // при изменении громкости
  useEffect(() => {
    const p = playerRef.current;
    if (p?.setVolume) p.setVolume(volume);
  }, [volume]);

  return playerRef;
}
