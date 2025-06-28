import React from "react";
import styles from "./Controls.module.scss";

export default function Controls({ onPrev, onPlayPause, onNext, playing }) {
  return (
    <div className={styles.controls}>
      <button onClick={onPrev}>Previous</button>
      <button onClick={onPlayPause}>{playing ? "Pause" : "Play"}</button>
      <button onClick={onNext}>Next</button>
    </div>
  );
}
