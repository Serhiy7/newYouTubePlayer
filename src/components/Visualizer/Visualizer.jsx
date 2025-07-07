// src/components/Visualizer/Visualizer.jsx
import React, {
  forwardRef,
  useEffect,
  useRef,
  useImperativeHandle,
} from "react";
import styles from "./Visualizer.module.scss";

export default forwardRef(function Visualizer({ audioRef }, ref) {
  const canvasRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const dataRef = useRef(null);
  const frameRef = useRef(null);

  useImperativeHandle(ref, () => ({
    init() {
      if (!audioRef.current) return;
      if (!audioCtxRef.current) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtxRef.current = new AudioContext();
        const source = audioCtxRef.current.createMediaElementSource(
          audioRef.current
        );
        analyserRef.current = audioCtxRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
        source.connect(analyserRef.current);
        dataRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);

        const ctx = canvasRef.current.getContext("2d");
        const draw = () => {
          frameRef.current = requestAnimationFrame(draw);
          analyserRef.current.getByteFrequencyData(dataRef.current);

          const { width, height } = canvasRef.current;
          ctx.clearRect(0, 0, width, height);

          // фон
          ctx.fillStyle = "#222";
          ctx.fillRect(0, 0, width, height);

          // градиентная заливка столбцов
          const grad = ctx.createLinearGradient(0, 0, 0, height);
          grad.addColorStop(0, "#4caf50");
          grad.addColorStop(1, "#fff");
          ctx.fillStyle = grad;

          const barCount = dataRef.current.length;
          const barWidth = width / barCount;
          let x = 0;
          for (let v of dataRef.current) {
            const barHeight = (v / 255) * height;
            // рисуем скруглённые столбцы
            const radius = 4;
            ctx.beginPath();
            ctx.moveTo(x, height);
            ctx.lineTo(x, height - barHeight + radius);
            ctx.quadraticCurveTo(
              x,
              height - barHeight,
              x + radius,
              height - barHeight
            );
            ctx.lineTo(x + barWidth - radius, height - barHeight);
            ctx.quadraticCurveTo(
              x + barWidth,
              height - barHeight,
              x + barWidth,
              height - barHeight + radius
            );
            ctx.lineTo(x + barWidth, height);
            ctx.closePath();
            ctx.fill();

            x += barWidth;
          }
        };
        draw();
      }
      // если аудиоконтекст приостановлен — активируем его
      if (audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume().catch(() => {});
      }
    },
  }));

  useEffect(() => {
    return () => {
      cancelAnimationFrame(frameRef.current);
      analyserRef.current?.disconnect();
      audioCtxRef.current?.close();
    };
  }, []);

  return (
    <div className={styles.wrapper}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        width={800}
        height={150}
      />
    </div>
  );
});
