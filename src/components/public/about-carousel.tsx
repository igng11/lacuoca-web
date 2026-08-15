"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { RoughFrame } from "@/components/rough-frame";
import { ABOUT_FRAME } from "@/data/rough-frame-path";

export function AboutCarousel({ photos }: { photos: string[] }) {
  const [index, setIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((next: number) => {
    setIndex(((next % photos.length) + photos.length) % photos.length);
  }, [photos.length]);

  useEffect(() => {
    if (photos.length < 2) return;
    timerRef.current = setInterval(() => setIndex((current) => (current + 1) % photos.length), 3500);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [photos.length]);

  if (!photos.length) return null;

  return (
    <>
      <div className="about-carousel">
        <div className="about-carousel-track" style={{ transform: `translateX(-${index * 100}%)` }}>
          {photos.map((photo) => (
            <div className="about-carousel-slide" key={photo}>
              <Image src={photo} alt="Nosotros" fill sizes="(max-width: 760px) 100vw, 50vw" />
            </div>
          ))}
        </div>
        <RoughFrame shape={ABOUT_FRAME} />
      </div>
      {photos.length > 1 && (
        <div className="about-carousel-dots" role="tablist" aria-label="Fotos de nosotros">
          {photos.map((photo, dotIndex) => (
            <button
              key={photo}
              type="button"
              role="tab"
              aria-selected={dotIndex === index}
              aria-label={`Ver foto ${dotIndex + 1}`}
              className={`about-carousel-dot ${dotIndex === index ? "is-active" : ""}`}
              onClick={() => goTo(dotIndex)}
            />
          ))}
        </div>
      )}
    </>
  );
}