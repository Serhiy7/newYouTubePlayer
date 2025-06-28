// Обёртка, чтобы гарантированно подгрузить YouTube API один раз
export const YTReady = new Promise((resolve) => {
  if (window.YT && window.YT.Player) {
    resolve(window.YT);
    return;
  }
  const tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  const firstScript = document.getElementsByTagName("script")[0];
  firstScript.parentNode.insertBefore(tag, firstScript);
  window.onYouTubeIframeAPIReady = () => resolve(window.YT);
});
