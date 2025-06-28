import React from "react";
import styles from "./PlaylistItem.module.scss";

export default function PlaylistItem({ track, isActive, onClick }) {
  const thumbUrl = `https://img.youtube.com/vi/${track.id}/hqdefault.jpg`;
  return (
    <div
      className={[styles.item, isActive ? styles.active : ""].join(" ")}
      style={{ "--thumb": `url('${thumbUrl}')` }}
      onClick={onClick}
    >
      <div
        className={styles.thumb}
        style={{ backgroundImage: `var(--thumb)` }}
      />
      <div className={styles.info}>
        <p className={styles.song}>{track.title}</p>
        <p className={styles.artist}>{track.artist}</p>
      </div>
    </div>
  );
}
