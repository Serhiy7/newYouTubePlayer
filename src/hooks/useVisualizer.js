// src/hooks/useVisualizer.js
import { useRef, useEffect } from "react";

export function useVisualizer(audioRef) {
  const canvasRef = useRef(null);
  const audioCtx = useRef(null);
  const analyser = useRef(null);
  const dataArray = useRef(null);
  const animationId = useRef(null);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas || !analyser.current) return;
    const ctx = canvas.getContext("2d");
    const { width, height } = canvas;

    analyser.current.getByteFrequencyData(dataArray.current);
    ctx.clearRect(0, 0, width, height);

    // фон
    ctx.fillStyle = "#222";
    ctx.fillRect(0, 0, width, height);

    // градиент
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, "#4caf50");
    grad.addColorStop(1, "#fff");
    ctx.fillStyle = grad;

    const barCount = dataArray.current.length;
    const barWidth = width / barCount;

    dataArray.current.forEach((value, i) => {
      const barHeight = (value / 255) * height;
      const x = i * barWidth;
      const r = 4;

      ctx.beginPath();
      ctx.moveTo(x, height);
      ctx.lineTo(x, height - barHeight + r);
      ctx.quadraticCurveTo(x, height - barHeight, x + r, height - barHeight);
      ctx.lineTo(x + barWidth - r, height - barHeight);
      ctx.quadraticCurveTo(
        x + barWidth,
        height - barHeight,
        x + barWidth,
        height - barHeight + r
      );
      ctx.lineTo(x + barWidth, height);
      ctx.closePath();
      ctx.fill();
    });

    animationId.current = requestAnimationFrame(draw);
  };

  const init = () => {
    if (!audioRef.current || audioCtx.current) return;

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx.current = new AudioContext();

    const source = audioCtx.current.createMediaElementSource(audioRef.current);
    analyser.current = audioCtx.current.createAnalyser();
    analyser.current.fftSize = 256;
    source.connect(analyser.current);

    dataArray.current = new Uint8Array(analyser.current.frequencyBinCount);

    draw();

    if (audioCtx.current.state === "suspended") {
      audioCtx.current.resume().catch(() => {});
    }
  };

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animationId.current);
      analyser.current?.disconnect();
      audioCtx.current?.close();
    };
  }, []);

  return { canvasRef, init };
}
