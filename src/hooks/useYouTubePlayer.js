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

  // обновляем onEnd без пересоздания плеера
  useEffect(() => {
    onEndRef.current = onEnd;
  }, [onEnd]);

  // формат времени mm:ss
  const fmt = (sec) => {
    const m = Math.floor(sec / 60);
    const s = String(Math.floor(sec % 60)).padStart(2, "0");
    return `${m}:${s}`;
  };

  //
  // 1) Эффект монтирования: создаём плеер только при первом рендере
  //
  useEffect(() => {
    let cancelled = false;
    YTReady.then((YT) => {
      if (cancelled) return;

      playerRef.current = new YT.Player(containerRef.current, {
        host: "https://www.youtube-nocookie.com",
        videoId, // инициализируем сразу с первым видео
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
            // прогресс
            clearInterval(intervalRef.current);
            if (e.data === YT.PlayerState.PLAYING) {
              intervalRef.current = setInterval(() => {
                const t = e.target.getCurrentTime();
                const d = e.target.getDuration();
                onProgress({
                  currentTime: fmt(t),
                  duration: fmt(d),
                  percent: d ? Math.round((t / d) * 100) : 0,
                });
              }, progressInterval);
            }
            // окончание
            if (e.data === YT.PlayerState.ENDED) {
              onEndRef.current();
            }
          },
        },
      });
    });

    return () => {
      cancelled = true;
      clearInterval(intervalRef.current);
      playerRef.current?.destroy();
    };
  }, [containerRef]); // <-- ЗАБЫЛИ убрать videoId и volume из зависимостей

  //
  // 2) Эффект смены ролика: просто загружаем новое видео в уже существующий плеер
  //
  useEffect(() => {
    const p = playerRef.current;
    if (p?.loadVideoById) {
      p.loadVideoById(videoId);
      p.playVideo();
    }
  }, [videoId]);

  //
  // 3) Эффект изменения громкости
  //
  useEffect(() => {
    const p = playerRef.current;
    if (p?.setVolume) {
      p.setVolume(volume);
    }
  }, [volume]);

  return playerRef;
}
