// src/components/YouTubePlayer/YouTubePlayer.jsx
import React, { useRef } from "react";
import styles from "./YouTubePlayer.module.scss";
import { useYouTubePlayer } from "../../hooks/useYouTubePlayer";

export default function YouTubePlayer({
  videoId,
  volume = 50,
  onProgress = () => {},
  onPlayerReady = () => {},
  onEnd = () => {},
}) {
  const containerRef = useRef(null);

  // хук сам создаст плеер и повесит все эффекты
  useYouTubePlayer({
    containerRef,
    videoId,
    volume,
    onProgress,
    onPlayerReady,
    onEnd,
  });

  return (
    <div className={` ${styles.wrapper} max-w-[850px] mx-auto`}>
      <div ref={containerRef} />
    </div>
  );
}
