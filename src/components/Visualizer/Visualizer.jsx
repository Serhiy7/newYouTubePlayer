// src/components/Visualizer/Visualizer.jsx
import React, { forwardRef, useImperativeHandle } from "react";
import { useVisualizer } from "../../hooks/useVisualizer";
import styles from "./Visualizer.module.scss";

const Visualizer = forwardRef(({ audioRef }, ref) => {
  const { canvasRef, init } = useVisualizer(audioRef);

  useImperativeHandle(ref, () => ({ init }), [init]);

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

export default Visualizer;
