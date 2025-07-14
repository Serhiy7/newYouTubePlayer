// src/hooks/useAudioPlayer.js
import { useState, useCallback, useEffect } from "react";
import { usePlaylist } from "./usePlaylist";

export function useAudioPlayer(initialPlaylist) {
  // 1) плейлист + поиск
  const { playlist, idx, select, next, prev, search } =
    usePlaylist(initialPlaylist);

  // 2) YouTube-плеер + play/pause + volume + progress
  const [player, setPlayer] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [progress, setProgress] = useState({
    currentTime: "0:00",
    duration: "0:00",
    percent: 0,
  });

  // Когда плеер готов — сохраняем его инстанс
  const onPlayerReady = useCallback(
    (yt) => {
      setPlayer(yt);
      yt.setVolume(volume);
    },
    [volume]
  );

  // Обработка прогресса видео (YouTubePlayer вызывает этот колбэк)
  const onProgress = useCallback(({ currentTime, duration, percent }) => {
    setProgress({ currentTime, duration, percent });
  }, []);

  // Когда видео дошло до конца — переходим к следующему
  const onEnd = useCallback(() => {
    next();
    setPlaying(true);
  }, [next]);

  // При изменении `playing` — запускаем или ставим на паузу YouTube-плеер
  useEffect(() => {
    if (!player) return;
    if (playing) {
      player.playVideo();
    } else {
      player.pauseVideo();
    }
  }, [playing, player]);

  // Меняем громкость в реальном времени
  useEffect(() => {
    if (player?.setVolume) player.setVolume(volume);
  }, [volume, player]);

  // Вспомогательные обработчики для UI
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

  // Парсер mm:ss → секунды
  const parseSec = (str) => {
    const [m, s] = str.split(":").map(Number);
    return m * 60 + s;
  };

  const onSeek = useCallback(
    (pct) => {
      if (!player) return;
      const total = parseSec(progress.duration);
      const to = (total * pct) / 100;
      player.seekTo(to, true);
      setProgress((p) => ({ ...p, percent: pct }));
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
    // события для UI
    onPlayPause,
    onPrev,
    onNext,
    onSelect,
    onSeek,
    onSearch,
    onVolumeChange: setVolume,
    onProgress,
    onPlayerReady,
    onEnd,
  };
}
