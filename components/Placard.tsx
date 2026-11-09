"use client";

type PlacardProps = {
  catalogue: string;
  title: string;
  medium: string;
  year: string;
  note?: string;
};

export default function Placard({
  catalogue,
  title,
  medium,
  year,
  note,
}: PlacardProps) {
  return (
    <div className="placard">
      {/* Sweeps up from the bottom on hover, retracts back down on
          hover-out. Sits behind the content via z-index, not DOM order,
          so it can cover the full card without needing to be last. */}
      <span className="fill" aria-hidden="true" />
      {/* <div className="frame" aria-hidden="true" /> */}
      
      <div className="text">
        <span className="catalogue">{catalogue}</span>
        <h3>{title}</h3>
        <p className="meta">
          {medium} · {year}
        </p>
        {note && <p className="note">{note}</p>}
      </div>

      <style jsx>{`
        .placard {
          position: relative;
          overflow: hidden;
          border: 1px solid var(--hairline);
          background: var(--shadow);
          /* fill the grid cell so cards in a row share one height */
          height: 100%;
          padding: clamp(1.1rem, 2vw, 1.5rem);
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          gap: 0.75rem;
          text-align: left;
          transition: border-color 0.25s ease, transform 0.25s ease;
        }
        @media (hover: hover) {
          .placard:hover {
            border-color: var(--brass);
            transform: translateY(-3px);
          }
        }
        .fill {
          position: absolute;
          inset: 0;
          background: var(--brass);
          transform: scaleY(0);
          transform-origin: bottom;
          transition: transform 0.45s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 0;
        }
        @media (hover: hover) {
          .placard:hover .fill {
            transform: scaleY(1);
          }
        }
        .frame,
        .text {
          position: relative;
          z-index: 1;
        }
        .text {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          flex: 1;
        }
        .frame {
          height: 9rem;
          background: linear-gradient(
            135deg,
            rgba(180, 140, 255, 0.18),
            rgba(75, 38, 112, 0.2)
          );
          border: 1px solid var(--hairline);
          transition: opacity 0.3s ease;
        }
        @media (hover: hover) {
          .placard:hover .frame {
            opacity: 0;
          }
        }
        .catalogue {
          font-family: var(--font-mono);
          font-size: 0.68rem;
          color: var(--brass);
          letter-spacing: 0.08em;
          transition: color 0.3s ease;
        }
        h3 {
          font-family: var(--font-unbounded);
          font-weight: 500;
          font-size: clamp(1.05rem, 1.6vw, 1.3rem);
          line-height: 1.2;
          overflow-wrap: anywhere;
          /* font-style: italic; */
          color: var(--plaster);
          transition: color 0.3s ease;
        }
        .meta {
          font-family: var(--font-mono);
          font-size: 0.74rem;
          color: var(--plaster-dim);
          text-transform: uppercase;
          letter-spacing: 0.04em;
          transition: color 0.3s ease;
        }
        .note {
          font-size: 0.88rem;
          color: var(--plaster-dim);
          line-height: 1.5;
          transition: color 0.3s ease;
        }
        /* Once the fill has swept up, the accent background needs dark
           text on top of it rather than the light-on-dark pairing used
           the rest of the time. */
        @media (hover: hover) {
          .placard:hover .catalogue,
          .placard:hover h3 {
            color: var(--wall);
          }
          .placard:hover .meta,
          .placard:hover .note {
            color: var(--wall-soft);
          }
        }
      `}</style>
    </div>
  );
}
