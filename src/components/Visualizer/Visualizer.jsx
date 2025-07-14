// src/components/Visualizer/Visualizer.jsx
import React, { useRef, useEffect } from "react";
import styles from "./Visualizer.module.scss";

export default function Visualizer() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const barCount = 48;
    const values = new Array(barCount).fill(0);
    const targets = new Array(barCount).fill(0).map(() => Math.random());
    const smoothing = 0.05; // чем меньше — тем плавнее и медленнее
    const changeThreshold = 0.01; // порог для генерации новой цели

    let animationId;
    const draw = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      // фон
      ctx.fillStyle = "#222";
      ctx.fillRect(0, 0, width, height);

      // градиент для баров
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, "#4caf50");
      grad.addColorStop(1, "#fff");
      ctx.fillStyle = grad;

      const barWidth = width / barCount;
      for (let i = 0; i < barCount; i++) {
        // обновляем текущее значение по направлению к цели
        values[i] += (targets[i] - values[i]) * smoothing;

        // если близко к цели — выбираем новую
        if (Math.abs(values[i] - targets[i]) < changeThreshold) {
          targets[i] = Math.random();
        }

        const barHeight = values[i] * height;
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
