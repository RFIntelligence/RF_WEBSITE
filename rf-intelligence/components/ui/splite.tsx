"use client";

/* eslint-disable @typescript-eslint/no-namespace -- types the spline-viewer custom element for JSX */

/** * SplineScene — renders a Spline 3D scene via the official spline-viewer
 * web component (loaded from CDN at runtime). Using the viewer element
 * instead of @splinetool/react-spline sidesteps the runtime package's
 * broken WASM/draco asset paths under Turbopack.
 */

import React, { useEffect, useState } from "react";

// eslint-disable-next-line @typescript-eslint/no-namespace -- required to type the spline-viewer custom element for JSX
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

interface SplineSceneProps {
  scene: string;
  className?: string;
}

export function SplineScene({ scene, className }: SplineSceneProps) {
  const viewerRef = React.useRef<HTMLElement>(null);
  const [ready, setReady] = useState(
    () =>
      typeof window !== "undefined" &&
      Boolean(customElements.get("spline-viewer")),
  );

  useEffect(() => {
    if (ready) return;
    const script = document.createElement("script");
    script.type = "module";
    script.src = VIEWER_SCRIPT;
    script.onload = () => setReady(true);
    document.head.appendChild(script);
    return () => {
      script.remove();
    };
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
    <div className="relative w-full h-full">
      {!ready && (
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
      <spline-viewer
        ref={viewerRef}
        url={scene}
        className={className}
        style={{ opacity: ready ? 1 : 0, transition: "opacity 0.4s ease" }}
      />
    </div>
  );
}

export default SplineScene;
