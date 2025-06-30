// src/App.jsx
import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import Sidebar from "./components/Sidebar/Sidebar";
import TopIcons from "./components/TopIcons/TopIcons";
import YouTubePlayer from "./components/YouTubePlayer/YouTubePlayer";
import Visualizer from "./components/Visualizer/Visualizer";
import ProgressBar from "./components/ProgressBar/ProgressBar";
import Controls from "./components/Controls/Controls";
import VolumeControl from "./components/VolumeControl/VolumeControl";
import "./index.scss";

const INITIAL_PLAYLIST = [
  { id: "dQf-bzmL5nU", title: "Méduse", artist: "BLR" },
  {
    id: "sK8eQWgGkKk",
    title: "Bora!Bora!Bora!",
    artist: "Scooter",
  },
  { id: "kJQP7kiw5Fk", title: "Despacito", artist: "Luis Fonsi" },

  { id: "5qm8PH4xAss", title: "In Da Club", artist: "50 Cent" },
  { id: "YVkUvmDQ3HY", title: "Without Me", artist: "Eminem" },
  { id: "_CL6n0FJZpk", title: "Still", artist: "Dr. Dre ft. Snoop Dogg" },
  { id: "ymNFyxvIdaM", title: "Freestyler", artist: "Bomfunk MC's" },

  {
    id: "uelHwf8o7_U",
    title: "Love The Way You Lie",
    artist: "Eminem ft. Rihanna",
  },
  { id: "60ItHLz5WEA", title: "Faded", artist: "Alan Walker " },
];

export default function App() {
  const [playlist, setPlaylist] = useState(INITIAL_PLAYLIST);
  const [idx, setIdx] = useState(0);

  const [player, setPlayer] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState({
    currentTime: "0:00",
    duration: "0:00",
    percent: 0,
  });
  const [volume, setVolume] = useState(50);

  const audioRef = useRef(null);

  // Поиск по YouTube (или сброс на INITIAL_PLAYLIST), с автозапуском
  const handleSearch = useCallback(async (q) => {
    if (!q) {
      setPlaylist(INITIAL_PLAYLIST);
      setIdx(0);
      setPlaying(true);
      return;
    }
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const json = await res.json();
      if (json.items) {
        setPlaylist(json.items);
        setIdx(0);
        setPlaying(true);
      }
    } catch (err) {
      console.error("Search error", err);
    }
  }, []);

  // Парсим "M:SS" → секунды
  const parseSec = (str) => {
    const [m, s] = str.split(":").map(Number);
    return m * 60 + s;
  };

  // Синхронизируем скрытое audio с YouTube-progress
  const handleProgress = useCallback(({ currentTime, duration, percent }) => {
    setProgress({ currentTime, duration, percent });
    const ytSec = parseSec(currentTime);
    const audio = audioRef.current;
    if (audio && Math.abs(audio.currentTime - ytSec) > 0.3) {
      audio.currentTime = ytSec;
    }
  }, []);

  // YouTube-player готов
  const handlePlayerReady = useCallback(
    (yt) => {
      setPlayer(yt);
      yt.setVolume(volume);
      setPlaying(false);
      audioRef.current?.load();
    },
    [volume]
  );

  // Автоплей следующего
  const handleEnd = useCallback(() => {
    const next = (idx + 1) % playlist.length;
    setIdx(next);
    setPlaying(true);
  }, [idx, playlist.length]);

  // Play / Pause оба плеера
  const handlePlayPause = () => {
    if (!player) return;
    if (playing) {
      player.pauseVideo();
      audioRef.current.pause();
    } else {
      player.playVideo();
      audioRef.current.play().catch(() => {});
    }
    setPlaying(!playing);
  };

  // Prev / Next
  const handlePrev = () => {
    const prev = (idx - 1 + playlist.length) % playlist.length;
    setIdx(prev);
    setPlaying(true);
  };
  const handleNext = () => {
    const next = (idx + 1) % playlist.length;
    setIdx(next);
    setPlaying(true);
  };

  // Выбор из Sidebar
  const handleSelect = useCallback((track, i) => {
    setIdx(i);
    setPlaying(true);
  }, []);

  // При смене трека — обновляем audio.src и, если «playing», сразу play()
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = `/api/audio?videoId=${playlist[idx].id}`;
    audio.load();
    if (playing) audio.play().catch(() => {});
  }, [playlist, idx, playing]);

  // Синхронизация play/pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    playing ? audio.play().catch(() => {}) : audio.pause();
  }, [playing]);

  // Seek
  const handleSeek = (pct) => {
    if (!player) return;
    const to = (parseSec(progress.duration) * pct) / 100;
    player.seekTo(to, true);
    setProgress((p) => ({ ...p, percent: pct }));
  };

  return (
    <div className="container">
      <Sidebar
        playlist={playlist}
        currentId={playlist[idx].id}
        onSelect={handleSelect}
        onSearchSubmit={handleSearch}
      />

      <main className="main">
        <TopIcons />

        <YouTubePlayer
          videoId={playlist[idx].id}
          volume={volume}
          onProgress={handleProgress}
          onPlayerReady={handlePlayerReady}
          onEnd={handleEnd}
        />

        <audio
          ref={audioRef}
          crossOrigin="anonymous"
          preload="auto"
          style={{ display: "none" }}
        />

        <Visualizer audioRef={audioRef} />

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

        <VolumeControl
          volume={volume}
          onVolumeChange={(v) => {
            setVolume(v);
            player?.setVolume(v);
          }}
        />
      </main>
    </div>
  );
}
