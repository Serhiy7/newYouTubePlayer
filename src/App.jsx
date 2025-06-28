import React, { useState, useCallback } from "react";
import Sidebar from "./components/Sidebar/Sidebar";
import TopIcons from "./components/TopIcons/TopIcons";
import YouTubePlayer from "./components/YouTubePlayer/YouTubePlayer";
import Visualizer from "./components/Visualizer/Visualizer";
import ProgressBar from "./components/ProgressBar/ProgressBar";
import Controls from "./components/Controls/Controls";
import VolumeControl from "./components/VolumeControl/VolumeControl";
import "./index.scss";

const PLAYLIST = [
  { id: "dQw4w9WgXcQ", title: "Song 1", artist: "Artist 1" },
  { id: "kJQP7kiw5Fk", title: "Song 2", artist: "Artist 2" },
  { id: "3JZ_D3ELwOQ", title: "Song 3", artist: "Artist 3" },
  { id: "Zi_XLOBDo_Y", title: "Song 4", artist: "Artist 4" },
  { id: "YQHsXMglC9A", title: "Song 5", artist: "Artist 5" },
  { id: "CevxZvSJLk8", title: "Song 6", artist: "Artist 6" },
  { id: "LsoLEjrDogU", title: "Song 7", artist: "Artist 7" },
  { id: "2vjPBrBU-TM", title: "Song 8", artist: "Artist 8" },
  { id: "uelHwf8o7_U", title: "Song 9", artist: "Artist 9" },
  { id: "60ItHLz5WEA", title: "Song 10", artist: "Artist 10" },
];

export default function App() {
  const [idx, setIdx] = useState(0);
  const [player, setPlayer] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState({
    currentTime: "0:00",
    duration: "0:00",
    percent: 0,
  });
  const [volume, setVolume] = useState(50);

  const current = PLAYLIST[idx];

  // получаем инстанс YT.Player один раз
  const handlePlayerReady = useCallback(
    (ytPlayer) => {
      setPlayer(ytPlayer);
      // поставить начальную громкость
      ytPlayer.setVolume(volume);
      setPlaying(false);
    },
    [volume]
  );

  // Play/Pause
  const handlePlayPause = () => {
    if (!player) return;
    if (playing) player.pauseVideo();
    else player.playVideo();
    setPlaying(!playing);
  };

  // переключение треков
  const handlePrev = () =>
    setIdx((i) => (i === 0 ? PLAYLIST.length - 1 : i - 1));
  const handleNext = () => setIdx((i) => (i + 1) % PLAYLIST.length);

  // выбор из списка
  const handleSelect = useCallback((_, i) => {
    setIdx(i);
    setPlaying(false);
  }, []);

  return (
    <div className="container">
      <Sidebar
        playlist={PLAYLIST}
        currentId={current.id}
        onSelect={handleSelect}
      />

      <main className="main">
        <TopIcons />

        <div style={{ width: 800, margin: "0 auto", padding: 20 }}>
          <YouTubePlayer
            videoId={current.id}
            onProgress={setProgress}
            onPlayerReady={handlePlayerReady}
            volume={volume}
          />
        </div>

        <Visualizer />

        <ProgressBar
          currentTime={progress.currentTime}
          duration={progress.duration}
          percent={progress.percent}
        />

        <Controls
          onPrev={handlePrev}
          onPlayPause={handlePlayPause}
          onNext={handleNext}
          playing={playing}
        />

        <VolumeControl volume={volume} onVolumeChange={setVolume} />
      </main>
    </div>
  );
}
