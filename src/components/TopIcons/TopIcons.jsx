import React from "react";
import styles from "./TopIcons.module.scss";

export default function TopIcons() {
  return (
    <div className={styles["top-icons"]}>
      <button className="btn">{/* видео SVG */}</button>
      <button className="btn">{/* кисть SVG */}</button>
      <button className="btn">{/* эквалайзер SVG */}</button>
    </div>
  );
}
