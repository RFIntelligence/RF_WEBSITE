"use client";

/* eslint-disable @typescript-eslint/no-namespace -- types the spline-viewer custom element for JSX */

/** * SplineScene — renders a Spline 3D scene via the official spline-viewer
 * web component (loaded from CDN at runtime). Using the viewer element
 * instead of @splinetool/react-spline sidesteps the runtime package's
 * broken WASM/draco asset paths under Turbopack.
 */

import React, { useEffect, useState } from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "spline-viewer": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & { url?: string };
    }
  }
}

const VIEWER_SCRIPT =
  "https://unpkg.com/@splinetool/viewer/build/spline-viewer.js";

/**
 * Kick off the viewer download as early as possible — at module evaluation
 * time, before React hydration runs effects. This shaves the CDN round-trip
 * off the footer robot's perceived loading time.
 */
function injectViewerScript() {
  if (typeof window === "undefined") return;
  if (customElements.get("spline-viewer")) return;
  if (document.querySelector(`script[src="${VIEWER_SCRIPT}"]`)) return;
  const script = document.createElement("script");
  script.type = "module";
  script.src = VIEWER_SCRIPT;
  document.head.appendChild(script);
}

if (typeof window !== "undefined") {
  // Run on import; also retry after hydration in case of early module eval
  injectViewerScript();
  window.addEventListener("DOMContentLoaded", injectViewerScript, {
    once: true,
  });
}

interface SplineSceneProps {
  scene: string;
  className?: string;
}

export function SplineScene({ scene, className }: SplineSceneProps) {
  const viewerRef = React.useRef<HTMLElement>(null);
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(
    () =>
      typeof window !== "undefined" &&
      Boolean(customElements.get("spline-viewer")),
  );
  // Only mount the viewer once its container has a real size — initializing
  // WebGPU against a 0x0 canvas throws GPUValidationError spam in the console.
  const [hasSize, setHasSize] = useState(false);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) setHasSize(true);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (ready) return;
    injectViewerScript();
    // Poll for the custom element's definition (the injected module script
    // resolves it asynchronously) instead of duplicating the script tag.
    const interval = setInterval(() => {
      if (customElements.get("spline-viewer")) {
        setReady(true);
        clearInterval(interval);
      }
    }, 80);
    return () => clearInterval(interval);
  }, [ready]);

  // Remove the "Built with Spline" badge inside the viewer's shadow DOM
  useEffect(() => {
    if (!ready) return;
    const root = viewerRef.current?.shadowRoot;
    if (!root) return;
    const removeBadge = () => root.querySelector("#logo")?.remove();
    removeBadge();
    const observer = new MutationObserver(removeBadge);
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [ready]);

  return (
    <div ref={wrapperRef} className="relative w-full h-full">
      {(!ready || !hasSize) && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            aria-hidden="true"
            className="block w-8 h-8 rounded-full border-2 animate-spin"
            style={{
              borderColor: "rgba(242, 78, 75, 0.25)",
              borderTopColor: "var(--accent)",
            }}
          />
        </div>
      )}
      {hasSize && (
        <spline-viewer
          ref={viewerRef}
          url={scene}
          className={className}
          style={{ opacity: ready ? 1 : 0, transition: "opacity 0.4s ease" }}
        />
      )}
    </div>
  );
}

export default SplineScene;
