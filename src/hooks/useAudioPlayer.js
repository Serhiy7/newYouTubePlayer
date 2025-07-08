// src/hooks/useAudioPlayer.js
import { useState, useRef, useCallback, useEffect } from "react";
import { usePlaylist } from "./usePlaylist";
import { useAudioSync } from "./useAudioSync";

export function useAudioPlayer(initialPlaylist) {
  const audioRef = useRef(null);
  const visualizerRef = useRef(null);

  // 1) плейлист + поиск
  const { playlist, idx, select, next, prev, search } =
    usePlaylist(initialPlaylist);

  // 2) плеер + play/pause + volume + progress
  const [player, setPlayer] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [progress, setProgress] = useState({
    currentTime: "0:00",
    duration: "0:00",
    percent: 0,
  });

  // колбэки для YouTubePlayer
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
    next();
    setPlaying(true);
  }, [next]);

  // 3) синхронизируем audioRef + visualizerRef с YouTubePlayer
  useAudioSync({
    audioRef,
    visualizerRef,
    player,
    playing,
    idx,
    playlist,
  });

  // смена громкости в реальном времени
  useEffect(() => {
    if (player?.setVolume) player.setVolume(volume);
  }, [volume, player]);

  // конвертер mm:ss → секунды
  const parseSec = (str) => {
    const [m, s] = str.split(":").map(Number);
    return m * 60 + s;
  };

  // вспомогательные обработчики UI
  const onPlayPause = useCallback(() => {
    if (!player) return;
    setPlaying((p) => !p);
  }, [player]);

  const onPrev = useCallback(() => {
    prev();
    setPlaying(true);
  }, [prev]);

  const onNext = useCallback(() => {
    next();
    setPlaying(true);
  }, [next]);

  const onSelect = useCallback(
    (_, i) => {
      select(i);
      setPlaying(true);
    },
    [select]
  );

  const onSeek = useCallback(
    (pct) => {
      if (!player) return;
      const total = parseSec(progress.duration);
      const to = (total * pct) / 100;
      player.seekTo(to, true);
      setProgress((p) => ({ ...p, percent: pct }));
      if (audioRef.current && Number.isFinite(to)) {
        audioRef.current.currentTime = to;
      }
    },
    [player, progress.duration]
  );

  const onSearch = useCallback(
    (q) => {
      search(q);
      setPlaying(true);
    },
    [search]
  );

  return {
    // данные
    playlist,
    idx,
    playing,
    volume,
    progress,
    audioRef,
    visualizerRef,
    // события для UI
    onPlayPause,
    onPrev,
    onNext,
    onSelect,
    onSeek,
    onSearch,
    onVolumeChange: setVolume,
    onProgress: handleProgress,
    onPlayerReady: handlePlayerReady,
    onEnd: handleEnd,
  };
}
