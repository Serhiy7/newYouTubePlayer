import React from "react";
import styles from "./VolumeControl.module.scss";

export default function VolumeControl({ volume, onVolumeChange }) {
  return (
    <div className={styles["volume-wrap"]}>
      <div className={styles["vol-label"]}>
        <span>Volume</span>
        <span className={styles["vol-num"]}>{volume}</span>
      </div>
      <div className={styles["vol-slider"]}>
        {/* нативный ползунок */}
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={(e) => onVolumeChange(Number(e.target.value))}
          className={styles.range}
        />
        <div className={styles.track}>
          <div className={styles.filled} style={{ width: `${volume}%` }} />
          <div className={styles.thumb} style={{ left: `${volume}%` }} />
        </div>
      </div>
    </div>
  );
}
