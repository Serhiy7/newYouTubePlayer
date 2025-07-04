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

          ctx.fillStyle = "#222";
          ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);

          const barWidth = canvasRef.current.width / dataRef.current.length;
          let x = 0;
          for (let v of dataRef.current) {
            const h = (v / 255) * canvasRef.current.height;
            ctx.fillStyle = "#fff";
            ctx.fillRect(x, canvasRef.current.height - h, barWidth, h);
            x += barWidth;
          }
        };
        draw();
      }
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
