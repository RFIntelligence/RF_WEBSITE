"use client";

/**
 * GlassShards — 4 rotating translucent 3D "glass shard" cards arranged in a
 * ring. Each shard represents one stage of RF's pipeline:
 * Capture → Process → Decide → Act
 *
 * Recolored to the About page palette (red/coral/ember tones on near-black glass).
 * Respects prefers-reduced-motion by pausing rotation.
 */

import React from "react";
import styled from "styled-components";

interface GlassShardsProps {
  className?: string;
}

const SHARDS = [
  { index: 0, label: "Capture", color: "230, 57, 70" },    // #E63946 accent red
  { index: 1, label: "Process", color: "255, 155, 138" },   // #FF9B8A highlight coral
  { index: 2, label: "Decide", color: "92, 26, 26" },       // #5C1A1A deep ember
  { index: 3, label: "Act", color: "230, 57, 70" },         // #E63946 accent red
] as const;

export function GlassShards({ className = "" }: GlassShardsProps) {
  return (
    <StyledWrapper className={className} aria-hidden="true">
      <div className="wrapper">
        <div
          className="inner"
          style={{ "--quantity": 4 } as React.CSSProperties}
        >
          {SHARDS.map((shard) => (
            <div
              key={shard.index}
              className="card"
              style={
                {
                  "--index": shard.index,
                  "--color-card": shard.color,
                } as React.CSSProperties
              }
            >
              <div className="img" />
              <span className="shard-label">{shard.label}</span>
            </div>
          ))}
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  width: 100%;
  height: 100%;
  pointer-events: none;

  .wrapper {
    width: 100%;
    height: 100%;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .inner {
    --w: 120px;
    --h: 180px;
    --translateZ: calc((var(--w) + var(--h)) + 20px);
    --rotateX: -15deg;
    --perspective: 1000px;

    position: absolute;
    width: var(--w);
    height: var(--h);
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 2;
    transform-style: preserve-3d;
    animation: rotating 20s linear infinite;
  }

  @keyframes rotating {
    from {
      transform: translate(-50%, -50%) perspective(var(--perspective))
        rotateX(var(--rotateX)) rotateY(0deg);
    }
    to {
      transform: translate(-50%, -50%) perspective(var(--perspective))
        rotateX(var(--rotateX)) rotateY(360deg);
    }
  }

  /* Pause rotation when user prefers reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .inner {
      animation-play-state: paused;
    }
  }

  .card {
    position: absolute;
    border: 1.5px solid rgba(var(--color-card), 0.6);
    border-radius: 12px;
    overflow: hidden;
    inset: 0;
    transform: rotateY(calc((360deg / var(--quantity)) * var(--index)))
      translateZ(var(--translateZ));
    backdrop-filter: blur(2px);
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding-bottom: 14px;
  }

  .img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(
      circle,
      rgba(var(--color-card), 0.08) 0%,
      rgba(var(--color-card), 0.25) 60%,
      rgba(var(--color-card), 0.45) 100%
    );
  }

  .shard-label {
    position: relative;
    z-index: 1;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(245, 241, 236, 0.6);
    font-family: var(--font-geist-sans, system-ui, sans-serif);
  }

  /* Responsive sizing */
  @media (min-width: 768px) {
    .inner {
      --w: 140px;
      --h: 210px;
      --translateZ: calc((var(--w) + var(--h)) + 30px);
    }
  }

  @media (min-width: 1024px) {
    .inner {
      --w: 160px;
      --h: 240px;
      --translateZ: calc((var(--w) + var(--h)) + 40px);
    }
  }
`;

export default GlassShards;
