import React, { useEffect, useRef } from "react";
import styles from "./Visualizer.module.scss";

export default function Visualizer({ audioRef }) {
  const canvasRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const dataRef = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // ждём canplay, чтобы src загрузился
    const onCanPlay = () => {
      if (audioCtxRef.current) return;

      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;

      // аудитория автоплей-политик
      audio.addEventListener("play", () => {
        if (audioCtx.state === "suspended") audioCtx.resume();
      });

      // подключаем только к анализатору (НЕ destination!)
      const source = audioCtx.createMediaElementSource(audio);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      // analyser.connect(audioCtx.destination); ← убрали, чтобы не дублировать звук
      analyserRef.current = analyser;

      const bufferLen = analyser.frequencyBinCount;
      dataRef.current = new Uint8Array(bufferLen);

      const ctx = canvasRef.current.getContext("2d");

      function draw() {
        frameRef.current = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataRef.current);

        // лог первых 8 частот для отладки
        console.log("🔊 freq slice:", dataRef.current.slice(0, 8));

        ctx.fillStyle = "#222";
        ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        const barWidth = canvasRef.current.width / bufferLen;
        let x = 0;
        for (let v of dataRef.current) {
          const h = (v / 255) * canvasRef.current.height;
          ctx.fillStyle = "#fff";
          ctx.fillRect(x, canvasRef.current.height - h, barWidth, h);
          x += barWidth;
        }
      }
      draw();
    };

    audio.addEventListener("canplay", onCanPlay);
    return () => {
      audio.removeEventListener("canplay", onCanPlay);
      cancelAnimationFrame(frameRef.current);
      if (analyserRef.current) analyserRef.current.disconnect();
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, [audioRef]);

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
}
