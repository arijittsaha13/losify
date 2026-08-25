'use client';

export function VideoBackground() {
  return <video className="background-video" autoPlay loop muted playsInline preload="metadata" disablePictureInPicture><source src="https://assets.mixkit.co/videos/preview/mixkit-ink-flowing-in-water-11787-large.mp4" type="video/mp4" /></video>;
}
