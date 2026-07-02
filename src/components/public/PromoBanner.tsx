"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface PromoBannerSlide {
  id: string;
  imageUrl: string;
  title: string;
  subtitle: string;
}

interface PromoBannerProps {
  slides: PromoBannerSlide[];
  intervalMs?: number;
}

export function PromoBanner({ slides, intervalMs = 5000 }: PromoBannerProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [slides.length, intervalMs]);

  if (!slides.length) return null;

  return (
    <div className="relative h-56 w-full overflow-hidden rounded-card md:h-80">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={cn(
            "absolute inset-0 transition-opacity duration-700",
            index === activeIndex ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          <Image
            src={slide.imageUrl}
            alt={slide.title}
            fill
            priority={index === 0}
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6">
            <span className="inline-block rounded-full bg-gradient-promo px-3 py-1 text-xs font-bold text-white mb-2">
              PROMO DO DIA
            </span>
            <h2 className="font-display text-2xl font-bold text-white md:text-4xl">
              {slide.title}
            </h2>
            <p className="text-sm text-white/80 md:text-base">{slide.subtitle}</p>
          </div>
        </div>
      ))}

      {/* Indicadores */}
      <div className="absolute bottom-3 right-4 flex gap-1.5">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            onClick={() => setActiveIndex(index)}
            aria-label={`Ir para slide ${index + 1}`}
            className={cn(
              "h-1.5 rounded-full transition-all",
              index === activeIndex ? "w-6 bg-accent" : "w-1.5 bg-white/40"
            )}
          />
        ))}
      </div>
    </div>
  );
}
