"use client";

const WINGS = [
  { id: "entrance", label: "Entrance" },
  { id: "wing-i", label: "Wing I — Works" },
  { id: "wing-ii", label: "Wing II — Media" },
  { id: "wing-iii", label: "Wing III — Artist" },
  { id: "wing-iv", label: "Wing IV — Visit" },
];

export default function WingNav() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="wing-nav" aria-label="Gallery wings">
      <div className="wing-nav-mark"><em>CENTER</em></div>
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
          width: clamp(3.2rem, 4vw, 7.5rem);
          border-right: 1px solid var(--hairline);
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1.75rem 0;
          z-index: 40;
          background: linear-gradient(
            180deg,
            var(--wall) 0%,
            var(--wall-soft) 100%
          );
        }
        .wing-nav-mark {
          // font-family: var(--font-mono);
          font-family: "BBH Bartle", sans-serif;
          font-size: 0.62rem;
          letter-spacing: 0.3em;
          color: var(--brass);
          writing-mode: vertical-rl;
          text-transform: uppercase;
          margin-bottom: 2.5rem;
        }
        ul {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 2.4rem;
          flex: 1;
          min-height: 0;
          justify-content: center;
          overflow-y: auto;
          padding: 0.5rem 0.5rem;
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
        button {
          background: none;
          border: none;
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
