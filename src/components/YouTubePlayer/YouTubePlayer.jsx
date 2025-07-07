// src/components/YouTubePlayer/YouTubePlayer.jsx
import React, { useEffect, useRef } from "react";
import styles from "./YouTubePlayer.module.scss";
import { YTReady } from "../../lib/yt";

export default function YouTubePlayer({
  videoId,
  volume = 50,
  onProgress = () => {},
  onPlayerReady = () => {},
  onEnd = () => {},
}) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const intervalRef = useRef(null);
  const onEndRef = useRef(onEnd);

  useEffect(() => {
    onEndRef.current = onEnd;
  }, [onEnd]);

  const fmt = (sec) => {
    const m = Math.floor(sec / 60);
    const s = String(Math.floor(sec % 60)).padStart(2, "0");
    return `${m}:${s}`;
  };

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
    }, 500);
  };

  useEffect(() => {
    let cancelled = false;
    YTReady.then((YT) => {
      if (cancelled) return;
      playerRef.current = new YT.Player(containerRef.current, {
        host: "https://www.youtube-nocookie.com",
        videoId, // initial
        playerVars: {
          controls: 0, // ОТКЛЮЧАЕМ нативные контролы
          disablekb: 1, // Блокируем клавиши
          modestbranding: 1, // Минимизируем лого
          rel: 0, // Без рекомендаций в конце
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
  }, []); // mount once

  // при изменении videoId сразу загружаем и запускаем видео
  useEffect(() => {
    const p = playerRef.current;
    if (p?.loadVideoById) {
      p.loadVideoById(videoId);
      p.playVideo();
    }
  }, [videoId]);

  useEffect(() => {
    const p = playerRef.current;
    if (p?.setVolume) p.setVolume(volume);
  }, [volume]);

  return (
    <div className={` ${styles.wrapper} max-w-[960px] mx-auto`}>
      {/* сюда YO­UTU­BE внедрит свой iframe/video */}
      <div ref={containerRef} />
      {/* если нужен свой оверлей на «плей» */}
    </div>
  );
}
