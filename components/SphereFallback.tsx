"use client";

import DROGlobeLogo from "@/components/DROGlobeLogo";

type SphereFallbackProps = {
  onToggleTheme: () => void;
  /** Omit when 3D has already failed, so the button isn't offered. */
  onLoad3D?: () => void;
};

/*
 * Static stand-in for the sphere. It keeps the sphere's one job besides
 * looking nice: clicking it switches the theme.
 */
export default function SphereFallback({
  onToggleTheme,
  onLoad3D,
}: SphereFallbackProps) {
  return (
    <div className="sphere-fallback">
      <button
        type="button"
        className="emblem"
        onClick={onToggleTheme}
        aria-label="Switch between light and dark theme"
      >
        {/* Passing viewBox here crops the square canvas to the oval globe. */}
        <DROGlobeLogo
          className="logo"
          viewBox="24 404 2000 1240"
          globeColor="var(--globe-color)"
          triangleColor="var(--triangle-color)"
          // size={50}
        />
      </button>

      {onLoad3D && (
        <button type="button" className="load-3d" onClick={onLoad3D}>
          View in 3D
        </button>
      )}

      <style jsx>{`
        .sphere-fallback {
          flex: 1;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1.4rem;
        }
        .emblem {
          appearance: none;
          border: 0;
          background: transparent;
          padding: 0;
          cursor: pointer;
          width: min(100%, 28rem);
        }
        .emblem :global(svg) {
          display: block;
          width: 100%;
          height: auto;
        }
        .emblem:focus-visible,
        .load-3d:focus-visible {
          outline: 1px solid var(--brass);
          outline-offset: 6px;
        }
        .load-3d {
          appearance: none;
          background: transparent;
          border: 0;
          border-bottom: 1px solid var(--brass);
          padding: 0 0 0.2rem;
          cursor: pointer;
          font-family: var(--font-mono);
          font-size: 0.68rem;
          letter-spacing: 0.08em;
          color: var(--brass-bright);
          transition: color 0.25s ease, border-color 0.25s ease;
        }
        .load-3d:hover {
          color: var(--plaster);
          border-color: var(--plaster);
        }
      `}</style>
    </div>
  );
}
