// src/components/Visualizer/Visualizer.jsx
import React, { useRef, useEffect } from "react";
import styles from "./Visualizer.module.scss";

export default function Visualizer() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationId;

    const draw = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      // фон
      ctx.fillStyle = "#222";
      ctx.fillRect(0, 0, width, height);

      // создаём градиент для баров
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, "#4caf50");
      grad.addColorStop(1, "#fff");
      ctx.fillStyle = grad;

      const barCount = 64;
      const barWidth = width / barCount;
      for (let i = 0; i < barCount; i++) {
        const value = Math.random(); // случайная высота
        const barHeight = value * height;
        const x = i * barWidth;
        ctx.fillRect(x + 1, height - barHeight, barWidth - 2, barHeight);
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationId);
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
}
