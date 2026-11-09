"use client";
import { COPY } from "@/app/content";


const WING_IDS = [
  "entrance",
  "wing-i",
  "wing-ii",
  "wing-iii",
  "wing-iv",
  "wing-v",
];

const WINGS = WING_IDS.map((id, i) => ({ id, label: COPY.nav[i] }));

export default function WingNav() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="wing-nav" aria-label="Gallery wings">
      <div className="wing-nav-mark"><em>{COPY.navMark}</em></div>
      <ul>
        {WINGS.map((w, i) => (
          <li key={w.id}>
            <button onClick={() => scrollTo(w.id)}>
              <span className="wing-index">
                {String(i).padStart(2, "0")}
              </span>
              <span className="wing-label">{w.label}</span>
            </button>
          </li>
        ))}
      </ul>

      <style jsx>{`
        .wing-nav {
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          width: var(--nav-w);
          border-right: 1px solid var(--hairline);
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1.75rem 0 1.25rem;
          z-index: 40;
          background: linear-gradient(
            180deg,
            var(--wall) 0%,
            var(--wall-soft) 100%
          );
        }
        .wing-nav-mark {
          /* font-family: var(--font-mono); */
          font-family: "BBH Bartle", sans-serif;
          font-size: 0.62rem;
          letter-spacing: 0.3em;
          color: var(--brass);
          writing-mode: vertical-rl;
          text-transform: uppercase;
          margin-bottom: 1.5rem;
          flex-shrink: 0;
          /* letter-spacing adds trailing space after the last glyph; pull
             it back so the mark sits optically centred in the rail */
          padding-block-end: 0.3em;
        }
        ul {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: clamp(1.25rem, 3.5vh, 2.4rem);
          flex: 1;
          min-height: 0;
          width: 100%;
          align-items: center;
          justify-content: flex-start;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 0.5rem 0 1rem;

          scrollbar-width: thin;
          scrollbar-color: var(--brass) transparent;
        }
        ul::-webkit-scrollbar {
          width: 4px;
        }
        ul::-webkit-scrollbar-thumb {
          background: var(--brass);
          border-radius: 2px;
        }
        li {
          display: flex;
          justify-content: center;
          width: 100%;
        }
        button {
          background: none;
          border: none;
          padding: 0;
          color: var(--plaster-dim);
          cursor: pointer;
          writing-mode: vertical-rl;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          transition: color 0.25s ease;
        }
        button:hover,
        button:focus-visible {
          color: var(--brass-bright);
        }
        .wing-index {
          font-family: var(--font-mono);
          font-size: 0.62rem;
          color: var(--brass);
        }
        .wing-label {
          font-family: var(--font-body);
          font-size: 0.72rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        @media (max-width: 720px) {
          .wing-nav {
            display: none;
          }
        }
      `}</style>
    </nav>
  );
}
