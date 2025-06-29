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

  // ref для скрытого <audio> (Visualizer)
  const audioRef = useRef(null);

  // Навешиваем логи на <audio> один раз
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    console.log("🔊 audio.readyState:", audio.readyState);

    const onCanPlay = () => console.log("🔊 audio canplay");
    const onAudioPlay = () => console.log("🔊 audio play event");
    const onAudioError = (e) => console.error("🔊 audio error:", e);

    audio.addEventListener("canplay", onCanPlay);
    audio.addEventListener("play", onAudioPlay);
    audio.addEventListener("error", onAudioError);

    return () => {
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("play", onAudioPlay);
      audio.removeEventListener("error", onAudioError);
    };
  }, []);

  // Фильтрация плейлиста
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

  // Сброс idx, если текущий трек исчез из filtered
  useEffect(() => {
    if (!filtered.find((t) => t.id === PLAYLIST[idx].id)) {
      const fb = filtered[0] || PLAYLIST[0];
      setIdx(PLAYLIST.findIndex((t) => t.id === fb.id));
    }
  }, [filtered, idx]);

  const current = PLAYLIST[idx];

  // Парсер времени "MM:SS" → секунды
  const parseSec = (str) => {
    const [m, s] = str.split(":").map(Number);
    return m * 60 + s;
  };

  // Колбэк на тик прогресса YouTube
  const handleProgress = useCallback(({ currentTime, duration, percent }) => {
    // 1) Обновляем UI
    setProgress({ currentTime, duration, percent });

    // 2) Синхронизируем скрытый audio
    const audio = audioRef.current;
    if (!audio) return;
    const ytSec = parseSec(currentTime);
    // подгоняем, если рассинхрон > 0.3 с
    if (Math.abs(audio.currentTime - ytSec) > 0.3) {
      audio.currentTime = ytSec;
    }
  }, []);

  // YouTube-player готов
  const handlePlayerReady = useCallback(
    (ytPlayer) => {
      setPlayer(ytPlayer);
      ytPlayer.setVolume(volume);
      setPlaying(false);
      audioRef.current?.load();
    },
    [volume]
  );

  // Автоплей по окончании
  const handleEnd = useCallback(() => {
    const i = filtered.findIndex((t) => t.id === current.id);
    const next = filtered[(i + 1) % filtered.length];
    setIdx(PLAYLIST.findIndex((t) => t.id === next.id));
    setPlaying(true);
  }, [current.id, filtered]);

  // Play/Pause YouTube + синхронный play/pause audio
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
    const i = filtered.findIndex((t) => t.id === current.id);
    const prev = filtered[(i - 1 + filtered.length) % filtered.length];
    setIdx(PLAYLIST.findIndex((t) => t.id === prev.id));
    setPlaying(true);
  };
  const handleNext = () => {
    const i = filtered.findIndex((t) => t.id === current.id);
    const next = filtered[(i + 1) % filtered.length];
    setIdx(PLAYLIST.findIndex((t) => t.id === next.id));
    setPlaying(true);
  };

  // Выбор из Sidebar
  const handleSelect = useCallback((track) => {
    const i = PLAYLIST.findIndex((t) => t.id === track.id);
    setIdx(i);
    setPlaying(true);
  }, []);

  // При смене трека — обновляем src и при play сразу play()
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = `/api/audio?videoId=${current.id}`;
    audio.load();
    if (playing) audio.play().catch(() => {});
  }, [current.id, playing]);

  // Синхронизация play/pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    playing ? audio.play().catch(() => {}) : audio.pause();
  }, [playing]);

  // Seek-слайдер
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
            onProgress={handleProgress}
            onPlayerReady={handlePlayerReady}
            onEnd={handleEnd}
          />
        </div>

        {/* скрытый audio для визуализатора */}
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
