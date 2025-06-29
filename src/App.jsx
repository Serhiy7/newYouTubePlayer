import React, { useState, useCallback, useMemo } from "react";
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
  const [search, setSearch] = useState("");
  const [player, setPlayer] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState({
    currentTime: "0:00",
    duration: "0:00",
    percent: 0,
  });
  const [volume, setVolume] = useState(50);

  // отфильтрованный по поиску список
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q === ""
      ? PLAYLIST
      : PLAYLIST.filter(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            t.artist.toLowerCase().includes(q)
        );
  }, [search]);

  // если текущий трек выпал из фильтра — сброс на первый
  React.useEffect(() => {
    if (!filtered.find((t) => t.id === PLAYLIST[idx].id)) {
      const fallback = filtered[0] || PLAYLIST[0];
      setIdx(PLAYLIST.findIndex((t) => t.id === fallback.id));
    }
  }, [filtered]);

  const current = PLAYLIST[idx];

  const handlePlayerReady = useCallback(
    (ytPlayer) => {
      setPlayer(ytPlayer);
      ytPlayer.setVolume(volume);
      setPlaying(false);
    },
    [volume]
  );

  // следующий трек по окончании
  const handleEnd = useCallback(() => {
    const i = filtered.findIndex((t) => t.id === current.id);
    const next = filtered[(i + 1) % filtered.length];
    const originalIdx = PLAYLIST.findIndex((t) => t.id === next.id);
    setIdx(originalIdx);
    setPlaying(true);
  }, [current.id, filtered]);

  const handlePlayPause = () => {
    if (!player) return;
    if (playing) player.pauseVideo();
    else player.playVideo();
    setPlaying(!playing);
  };

  // Prev по filtered → original index
  const handlePrev = () => {
    const i = filtered.findIndex((t) => t.id === current.id);
    const prev = filtered[(i - 1 + filtered.length) % filtered.length];
    const originalIdx = PLAYLIST.findIndex((t) => t.id === prev.id);
    setIdx(originalIdx);
    setPlaying(true);
  };
  // Next по filtered → original index
  const handleNext = () => {
    const i = filtered.findIndex((t) => t.id === current.id);
    const next = filtered[(i + 1) % filtered.length];
    const originalIdx = PLAYLIST.findIndex((t) => t.id === next.id);
    setIdx(originalIdx);
    setPlaying(true);
  };

  // выбор из списка: передаём весь объект track
  const handleSelect = useCallback((track) => {
    const originalIdx = PLAYLIST.findIndex((t) => t.id === track.id);
    if (originalIdx >= 0) {
      setIdx(originalIdx);
      setPlaying(true);
    }
  }, []);

  const parseSec = (str) => {
    const [m, s] = str.split(":").map(Number);
    return m * 60 + s;
  };
  const handleSeek = (pct) => {
    if (!player) return;
    const dur = parseSec(progress.duration);
    const to = (dur * pct) / 100;
    player.seekTo(to, true);
    const mm = Math.floor(to / 60);
    const ss = String(Math.floor(to % 60)).padStart(2, "0");
    setProgress({
      currentTime: `${mm}:${ss}`,
      duration: progress.duration,
      percent: Math.round(pct),
    });
  };

  return (
    <div className="container">
      <Sidebar
        playlist={filtered}
        currentId={current.id}
        onSelect={handleSelect}
        searchValue={search}
        onSearchChange={setSearch}
      />

      <main className="main">
        <TopIcons />

        <div style={{ width: 800, margin: "0 auto", padding: 20 }}>
          <YouTubePlayer
            videoId={current.id}
            volume={volume}
            onProgress={setProgress}
            onPlayerReady={handlePlayerReady}
            onEnd={handleEnd}
          />
        </div>

        <Visualizer />

        <ProgressBar
          currentTime={progress.currentTime}
          duration={progress.duration}
          percent={progress.percent}
          onSeek={handleSeek}
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
