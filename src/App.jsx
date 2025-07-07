// src/App.jsx
import React, { useState, useCallback, useRef, useEffect } from "react";
import Sidebar from "./components/Sidebar/Sidebar";
import TopIcons from "./components/TopIcons/TopIcons";
import YouTubePlayer from "./components/YouTubePlayer/YouTubePlayer";
import Visualizer from "./components/Visualizer/Visualizer";
import ProgressBar from "./components/ProgressBar/ProgressBar";
import Controls from "./components/Controls/Controls";
import VolumeControl from "./components/VolumeControl/VolumeControl";
import "./index.scss";

const INITIAL_PLAYLIST = [
  { id: "_CL6n0FJZpk", title: "Still", artist: "Dr. Dre ft. Snoop Dogg" },
  { id: "YVkUvmDQ3HY", title: "Without Me", artist: "Eminem" },
  { id: "dQf-bzmL5nU", title: "Méduse", artist: "BLR" },
  { id: "sK8eQWgGkKk", title: "Bora!Bora!Bora!", artist: "Scooter" },
  { id: "kJQP7kiw5Fk", title: "Despacito", artist: "Luis Fonsi" },
  { id: "5qm8PH4xAss", title: "In Da Club", artist: "50 Cent" },
  { id: "ymNFyxvIdaM", title: "Freestyler", artist: "Bomfunk MC's" },
  {
    id: "uelHwf8o7_U",
    title: "Love The Way You Lie",
    artist: "Eminem ft. Rihanna",
  },
  { id: "60ItHLz5WEA", title: "Faded", artist: "Alan Walker" },
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
  const visualizerRef = useRef(null);

  const parseSec = (str) => {
    const [m, s] = str.split(":").map(Number);
    return m * 60 + s;
  };

  const handleProgress = useCallback(({ currentTime, duration, percent }) => {
    setProgress({ currentTime, duration, percent });
  }, []);

  const handlePlayerReady = useCallback(
    (yt) => {
      setPlayer(yt);
      yt.setVolume(volume);
    },
    [volume]
  );

  const handleEnd = useCallback(() => {
    setIdx((i) => (i + 1) % playlist.length);
    setPlaying(true);
  }, [playlist.length]);

  // 1) Load audio URL on track change
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = `/api/audio?videoId=${playlist[idx].id}`;
    audio.load();
  }, [idx, playlist]);

  // 2) Play/pause & init visualizer, syncing audio after canplay
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !player) return;

    // start or pause video immediately
    if (playing) {
      player.playVideo();
    } else {
      player.pauseVideo();
      audio.pause();
      return;
    }

    // when audio is ready, sync time and init viz
    const startAudioAndViz = () => {
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
      startAudioAndViz();
    } else {
      audio.addEventListener("canplay", startAudioAndViz, { once: true });
    }

    return () => {
      audio.removeEventListener("canplay", startAudioAndViz);
    };
  }, [playing, idx, player]);

  const handlePlayPause = () => {
    if (!player) return;
    setPlaying((p) => !p);
  };
  const handlePrev = () => {
    setIdx((i) => (i - 1 + playlist.length) % playlist.length);
    setPlaying(true);
  };
  const handleNext = () => {
    setIdx((i) => (i + 1) % playlist.length);
    setPlaying(true);
  };
  const handleSelect = useCallback((_, i) => {
    setIdx(i);
    setPlaying(true);
  }, []);
  const handleSeek = (pct) => {
    if (!player) return;
    const to = (parseSec(progress.duration) * pct) / 100;
    player.seekTo(to, true);
    setProgress((p) => ({ ...p, percent: pct }));
    if (audioRef.current) {
      const t = to;
      if (Number.isFinite(t)) audioRef.current.currentTime = t;
    }
  };

  const handleSearch = useCallback(async (q) => {
    if (!q) {
      setPlaylist(INITIAL_PLAYLIST);
      setIdx(0);
      setPlaying(true);
      return;
    }
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
    const json = await res.json();
    if (json.items) {
      setPlaylist(json.items);
      setIdx(0);
      setPlaying(true);
    }
  }, []);

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

        <Visualizer audioRef={audioRef} ref={visualizerRef} />

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
