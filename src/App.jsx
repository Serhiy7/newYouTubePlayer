// src/App.jsx
import React from "react";
import Sidebar from "./components/Sidebar/Sidebar";
import YouTubePlayer from "./components/YouTubePlayer/YouTubePlayer";
import Visualizer from "./components/Visualizer/Visualizer";
import ProgressBar from "./components/ProgressBar/ProgressBar";
import Controls from "./components/Controls/Controls";
import VolumeControl from "./components/VolumeControl/VolumeControl";
import "./index.scss";

import { useAudioPlayer } from "./hooks/useAudioPlayer";
import { INITIAL_PLAYLIST } from "./data/playlist";

export default function App() {
  const {
    playlist,
    idx,
    playing,
    volume,
    progress,
    audioRef,
    visualizerRef,
    onPlayPause,
    onPrev,
    onNext,
    onSelect,
    onSeek,
    onSearch,
    onVolumeChange,
    onProgress,
    onPlayerReady,
    onEnd,
  } = useAudioPlayer(INITIAL_PLAYLIST);

  return (
    <div className="container">
      <Sidebar
        playlist={playlist}
        currentId={playlist[idx].id}
        onSelect={onSelect}
        onSearchSubmit={onSearch}
      />

      <main className="main">
        <YouTubePlayer
          videoId={playlist[idx].id}
          volume={volume}
          onProgress={onProgress}
          onPlayerReady={onPlayerReady}
          onEnd={onEnd}
        />

        <audio
          ref={audioRef}
          crossOrigin="anonymous"
          preload="auto"
          style={{ display: "none" }}
        />

        <Visualizer audioRef={audioRef} ref={visualizerRef} />

        <ProgressBar
          currentTime={progress.currentTime}
          duration={progress.duration}
          percent={progress.percent}
          onSeek={onSeek}
        />

        <Controls
          onPrev={onPrev}
          onPlayPause={onPlayPause}
          onNext={onNext}
          playing={playing}
        />

        <VolumeControl volume={volume} onVolumeChange={onVolumeChange} />
      </main>
    </div>
  );
}
