import React, { useEffect, useRef } from "react";
import styles from "./YouTubePlayer.module.scss";
import { YTReady } from "../../lib/yt";

export default function YouTubePlayer({
  videoId,
  volume = 50,
  onProgress = () => {},
  onPlayerReady = () => {},
}) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const intervalRef = useRef(null);

  const fmt = (sec) => {
    const m = Math.floor(sec / 60);
    const s = String(Math.floor(sec % 60)).padStart(2, "0");
    return `${m}:${s}`;
  };

  // опрос прогресса
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

  // 1) Создаём плеер только раз при монтировании
  useEffect(() => {
    let canceled = false;
    YTReady.then((YT) => {
      if (canceled || playerRef.current) return;

      playerRef.current = new YT.Player(containerRef.current, {
        host: "https://www.youtube-nocookie.com",
        videoId,
        playerVars: {
          autoplay: 0,
          controls: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (e) => {
            const ifr = e.target.getIframe();
            ifr.removeAttribute("width");
            ifr.removeAttribute("height");
            e.target.setVolume(volume);
            onPlayerReady(e.target);
          },
          onStateChange: (e) => {
            if (e.data === YT.PlayerState.PLAYING) startProgress();
            else clearInterval(intervalRef.current);
          },
        },
      });
    });

    return () => {
      canceled = true;
      clearInterval(intervalRef.current);
      if (playerRef.current?.destroy) playerRef.current.destroy();
    };
  }, []); // пустой массив — один раз

  // 2) На изменение videoId — загружаем и сразу play
  useEffect(() => {
    const p = playerRef.current;
    if (p?.loadVideoById) {
      p.loadVideoById(videoId);
      p.playVideo();
      startProgress();
    }
  }, [videoId]);

  // 3) На изменение громкости — меняем её в плеере
  useEffect(() => {
    const p = playerRef.current;
    if (p?.setVolume) p.setVolume(volume);
  }, [volume]);

  return <div ref={containerRef} className={styles.wrapper} />;
}
