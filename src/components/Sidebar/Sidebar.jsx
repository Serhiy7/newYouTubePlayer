import React, { useState } from "react";
import PlaylistItem from "../PlaylistItem/PlaylistItem";
import styles from "./Sidebar.module.scss";

export default function Sidebar({
  playlist,
  currentId,
  onSelect,
  onSearchSubmit,
}) {
  const [q, setQ] = useState("");
  return (
    <aside className={styles.sidebar}>
      <form
        className={styles.search}
        onSubmit={(e) => {
          e.preventDefault();
          onSearchSubmit(q.trim());
        }}
      >
        <div className={styles.icon}>🔍</div>
        <input
          type="text"
          placeholder="Search YouTube…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </form>

      <h3 className={styles["playlist-title"]}>Playlist</h3>
      <div className={styles.playlist}>
        {playlist.map((track, i) => (
          <PlaylistItem
            key={track.id}
            track={track}
            isActive={track.id === currentId}
            onClick={() => onSelect(track, i)}
          />
        ))}
      </div>
    </aside>
  );
}
