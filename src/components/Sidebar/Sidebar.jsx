// src/components/Sidebar/Sidebar.jsx
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
        <button type="submit" className={styles.searchBtn} aria-label="Search">
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M15.5,14H14.71l-.43-.43A6.978,6.978,0,0,0,16,9a7,7,0,1,0-7,7,6.978,6.978,0,0,0,4.57-1.72l.43.43v.79l5,4.99L20.49,19Zm-6.5,0A5,5,0,1,1,14,9,5,5,0,0,1,9,14Z"
            />
          </svg>
        </button>

        <input
          type="search"
          placeholder="Search YouTube…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search YouTube"
        />
      </form>

      <h3 className={styles["playlist-title"]}>Playlist</h3>
      <div className={styles.playlist}>
        {playlist.map((track, i) => (
          <PlaylistItem
            key={track.id ?? `track-${i}`}
            track={track}
            isActive={track.id === currentId}
            onClick={() => onSelect(track, i)}
          />
        ))}
      </div>
    </aside>
  );
}
