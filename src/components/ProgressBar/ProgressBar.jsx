import React from "react";
import styles from "./ProgressBar.module.scss";

export default function ProgressBar({
  currentTime,
  duration,
  percent,
  onSeek = () => {},
}) {
  const handleClick = (e) => {
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - left;
    const pct = Math.max(0, Math.min(100, (x / width) * 100));
    onSeek(pct);
  };

  return (
    <div className={styles["progress-wrap"]}>
      <div className={styles.times}>
        <span>
          {currentTime} / {duration}
        </span>
        <span>{percent}%</span>
      </div>
      <div className={styles.bar} onClick={handleClick}>
        <div className={styles.fill} style={{ width: `${percent}%` }} />
        <div
          className={styles.thumb}
          style={{ left: `${percent}%` }}
          /* можно также слушать drag события тут */
        />
      </div>
    </div>
  );
}
