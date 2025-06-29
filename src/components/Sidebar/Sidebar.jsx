import React from "react";
import PlaylistItem from "../PlaylistItem/PlaylistItem";
import styles from "./Sidebar.module.scss";

export default function Sidebar({
  playlist,
  currentId,
  onSelect,
  searchValue,
  onSearchChange,
}) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.search}>
        <div className={styles.icon}>🔍</div>
        <input
          type="text"
          placeholder="Search"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <h3 className={styles["playlist-title"]}>Playlist</h3>

      <div className={styles.playlist}>
        {playlist.map((track) => (
          <PlaylistItem
            key={track.id}
            track={track}
            isActive={track.id === currentId}
            onClick={() => onSelect(track)}
          />
        ))}
      </div>
    </aside>
  );
}
