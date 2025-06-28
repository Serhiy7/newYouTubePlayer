import React from "react";
import styles from "./ProgressBar.module.scss";

export default function ProgressBar({ currentTime, duration, percent }) {
  return (
    <div className={styles["progress-wrap"]}>
      <div className={styles.times}>
        <span>
          {currentTime} / {duration}
        </span>
        <span>{percent}%</span>
      </div>
      <div className={styles.bar}>
        <div className={styles.fill} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
