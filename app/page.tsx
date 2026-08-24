"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import AOS from "aos";
import WingNav from "@/components/WingNav";
import Placard from "@/components/Placard";

const Sculpture = dynamic(() => import("@/components/Sculpture"), {
  ssr: false,
});

const WORKS = [
  {
    catalogue: "CAT. 01",
    title: "Still Life, Late Light",
    medium: "Graphite on paper",
    year: "2024",
    note: "A study of shadow falling across an unfinished table setting.",
  },
  {
    catalogue: "CAT. 02",
    title: "Interior, Held Breath",
    medium: "Oil on canvas",
    year: "2024",
    note: "Warm underpainting left visible at the edges of the frame.",
  },
  {
    catalogue: "CAT. 03",
    title: "Study in Reflection",
    medium: "Digital",
    year: "2025",
    note: "Built from layered brush passes rather than flat vector shapes.",
  },
  {
    catalogue: "CAT. 04",
    title: "Fruit, Glass, Dust",
    medium: "Charcoal and pencil",
    year: "2023",
    note: "Returned to twice, a year apart, to correct the light.",
  },
];

const ROOMS = [
  {
    label: "Room A",
    title: "Pencil",
    copy: "Line work first — the sketches that decide whether a piece is worth taking further.",
  },
  {
    label: "Room B",
    title: "Paint",
    copy: "Oil and acrylic studies built in layers, usually slower than everything else here.",
  },
  {
    label: "Room C",
    title: "Digital",
    copy: "Brush-based digital painting alongside the interactive, code-built pieces like the sculpture at the entrance.",
  },
  {
    label: "Room D",
    title: "Still Life",
    copy: "Arranged objects, observed directly — the recurring subject across every other medium here.",
  },
];

export default function Home() {
  // The inline script in layout.tsx runs before paint and already sets
  // data-theme on <html> based on the saved choice (or system
  // preference). This just syncs React's state to match it — it never
  // writes a default back to the DOM, which is what would cause a
  // flash if the real saved theme were "light".
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);
  const [loaderExiting, setLoaderExiting] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    if (current === "light" || current === "dark") {
      setTheme(current);
    }
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      window.localStorage.setItem("theme", next);
      return next;
    });
  };

  useEffect(() => {
    if (!mounted) return;

    AOS.init({
      duration: 600,
      easing: "ease-out-cubic",
      once: true,
      offset: 60,
      disable: () =>
        window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    });

    AOS.refreshHard();
  }, [mounted]);

  return (
    <>
      {!mounted && (
        <div
          className={`initial-loader ${loaderExiting ? "loader-exiting" : ""
            }`}
        >
          <div className="initial-loader-content">
            <span>THE</span>
            <strong>GALLERY</strong>

            <div className="loader-progress">
              <div
                className="loader-progress-bar"
                style={{
                  width: `${loadingProgress}%`,
                }}
              />
            </div>

            <div className="loader-percentage">
              {Math.round(loadingProgress)}%
            </div>
          </div>
        </div>
      )}

      <div className={mounted ? "site-mounted" : "site-hidden"}>
        <WingNav />
        <main className="gallery">
          {/* ENTRANCE — pinned for a scroll runway, then released to Wing I */}
          <section id="entrance" className="entrance-wrapper">
            <div className="entrance-pin">
              <div className="entrance-copy">
                <span className="eyebrow" data-aos="fade-up">
                  Derrick Ongwae
                </span>
                <h1 data-aos="fade-right" data-aos-delay="150">
                  <span className="title-the">THE</span>
                  <em>center</em>
                </h1>
                <p className="eyebrow-" data-aos="fade-right" data-aos-delay="300">
                  One room, four wings. Pencil, paint, digital, and still life —
                  worked on in whichever order the subject demands. Turn the
                  piece at the centre; it turns back.
                </p>
              </div>
              <div className="entrance-sculpture">
                <Sculpture
                  onNavigate={(id) =>
                    document
                      .getElementById(id)
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  onToggleTheme={toggleTheme}
                  theme={theme}
                  onProgress={setLoadingProgress}
                  onReady={() => {
                    setLoaderExiting(true);

                    window.setTimeout(() => {
                      setMounted(true);
                    }, 700);
                  }}
                />
                <span className="plinth-label" data-aos="fade-up" data-aos-delay="320">
                  Fig. 0 — Untitled (Kinetic Study), glass, ongoing
                </span>
              </div>
            </div>
          </section>

          {/* WING I — WORKS. Pulled up over the entrance's tail, then pinned
            in its own runway so Wing II can do the same to it. */}
          <section id="wing-i" className="wing-runway wing-i-overlap">
            <div className="wing-pin">
              <div className="section-inner">
                <span className="eyebrow" data-aos="fade-up">
                  Wing I
                </span>
                <h2 data-aos="fade-up" data-aos-delay="100">
                  Recent works
                </h2>
                <div className="works-grid">
                  {WORKS.map((w, i) => (
                    <div
                      key={w.catalogue}
                      data-aos="fade-up"
                      data-aos-delay={150 + i * 100}
                    >
                      <Placard {...w} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* WING II — MEDIA. Same treatment: overlaps Wing I's tail, then
            pins for Wing III to overlap in turn. */}
          <section id="wing-ii" className="wing-runway wing-ii-overlap">
            <div className="wing-pin">
              <div className="section-inner">
                <span className="eyebrow" data-aos="fade-up">
                  Wing II
                </span>
                <h2 data-aos="fade-up" data-aos-delay="100">
                  The four rooms
                </h2>
                <div className="rooms-grid">
                  {ROOMS.map((r, i) => (
                    <div
                      className="room"
                      key={r.title}
                      data-aos="fade-up"
                      data-aos-delay={150 + i * 100}
                    >
                      <span className="room-label">{r.label}</span>
                      <h3>{r.title}</h3>
                      <p>{r.copy}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* WING III — ARTIST. Overlaps Wing II's tail, pins for Wing IV. */}
          <section id="wing-iii" className="wing-runway wing-iii-overlap">
            <div className="wing-pin">
              <div className="section-inner artist">
                <span className="eyebrow" data-aos="fade-up">
                  Wing III
                </span>
                <h2 data-aos="fade-up" data-aos-delay="100">
                  About the artist
                </h2>
                <p data-aos="fade-up" data-aos-delay="200">
                  Derrick works across pencil, paint, and digital media, most
                  often returning to still life as a way of re-examining how
                  light sits on ordinary objects. Outside the studio, he builds
                  the software this gallery runs on — including the sculpture
                  you can turn at the entrance.
                </p>
              </div>
            </div>
          </section>

          {/* WING IV — VISIT. Final section: just overlaps Wing III's tail,
            no runway of its own since nothing follows it. */}
          <section id="wing-iv" className="wing-runway wing-iv-overlap">
            <div className="wing-pin">
              <div className="section-inner">
                <span className="eyebrow" data-aos="fade-up">
                  Wing IV
                </span>
                <h2 data-aos="fade-up" data-aos-delay="100">
                  Visit
                </h2>
                <p className="visit" data-aos="fade-up" data-aos-delay="200">
                  For commissions, exhibitions, or a closer look at any piece,
                  reach out directly.
                </p>
                <a
                  className="visit-link"
                  href="mailto:hello@derrickongwae.com"
                  data-aos="fade-up"
                  data-aos-delay="300"
                >
                  hello@derrickongwae.com
                </a>
              </div>
            </div>
          </section>
        </main>

        <style jsx>{`
        .gallery {
          margin-left: clamp(3.2rem, 4vw, 7.5rem);
        }

        /* ---------- Entrance ---------- */
        .initial-loader {
          position: fixed;
          inset: 0;
          z-index: 99999;
          background: var(--wall);
          color: var(--plaster);

          display: flex;
          align-items: center;
          justify-content: center;

          transform: translateY(0);
          opacity: 1;

          transition:
            transform 700ms cubic-bezier(0.76, 0, 0.24, 1),
            opacity 700ms ease;

          pointer-events: auto;
        }
        .loader-progress {
          width: clamp(180px, 25vw, 320px);
          height: 1px;
          margin-top: 2rem;

          background: var(--hairline);
          overflow: hidden;
        }

        .loader-progress-bar {
          height: 100%;
          width: 0%;

          background: var(--brass);

          transition: width 180ms ease-out;
        }

        .loader-percentage {
          margin-top: 0.65rem;

          font-family: var(--font-mono);
          font-size: 0.68rem;
          letter-spacing: 0.08em;

          color: var(--plaster-dim);

          align-self: flex-end;
        }
        .initial-loader.loader-exiting {
          transform: translateY(-100%);
          opacity: 0;
          pointer-events: none;
        }
        .initial-loader-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          font-family: "BBH Bartle", sans-serif;
          line-height: 0.85;
        }

        .initial-loader-content span {
          background: var(--brass);
          color: var(--wall);
          padding: 0.12em 0.3em 0.18em;
        }

        .initial-loader-content strong {
          font-size: clamp(3rem, 10vw, 7rem);
          font-style: italic;
          color: var(--brass-bright);
        }

        .site-hidden {
          visibility: hidden;
        }

        .site-mounted {
           visibility: visible;
        }

        .entrance-wrapper {
          position: relative;
          min-height: 220vh;
          scroll-snap-align: start;
        }
        .entrance-pin {
          position: sticky;
          top: 0;
          height: 100svh;
          display: flex;
          align-items: center;
          gap: clamp(2rem, 5vw, 5rem);
          flex-wrap: wrap;
          padding: clamp(1.5rem, 6vw, 5rem);
          background: var(--wall);
          overflow: hidden;
        }
        .entrance-copy {
          flex: 1 1 320px;
          max-width: 32rem;
        }
        .entrance-copy h1 {
          // font-family: var(--font-display);
          font-family: "BBH Bartle", sans-serif;
          // font-family: var(--font-unbounded);
          font-weight: 800;
          font-size: clamp(2.6rem, 7vw, 4.6rem);
          line-height: 1.02;
          margin: 0.9rem 0 1.4rem;
          color: var(--plaster);
        }
        .entrance-copy h1 .title-the {
          display: block;
          width: fit-content;
          background: var(--brass);
          color: var(--wall);
          padding: 0.15em 0.35em 0.2em;
          line-height: 0.9;
          margin-bottom: 0.05em;
        }
        .entrance-copy h1 em {
          display: block;
          font-style: italic;
          color: var(--brass-bright);
        }
        .entrance-copy p {
          font-size: 1.02rem;
          line-height: 1.65;
          color: var(--plaster-dim);
          max-width: 30rem;
        }
        .entrance-sculpture {
          flex: 1 1 380px;
          height: min(480px, 60vh);
          position: relative;
          display: flex;
          flex-direction: column;
        }
        .plinth-label {
          margin-top: 0.6rem;
          font-family: var(--font-mono);
          font-size: 0.68rem;
          letter-spacing: 0.04em;
          color: var(--plaster-dim);
          text-align: center;
        }

        /* ---------- Shared wing runway/pin/overlap pattern ----------
           Every wing after the entrance uses the same three-part trick:
           1. .wing-runway reserves extra scroll distance (min-height).
           2. .wing-pin sticks to the top of the viewport for that distance.
           3. The *next* wing gets a negative margin-top pulling it up into
              the tail of the current one's runway, with a transparent
              background, so it visibly scrolls up and over the still-
              pinned content underneath before that pin finally releases.
           Transparency is safe at any point in that process because the
           page background (body) is the same wall color underneath. */
        .wing-runway {
          position: relative;
          min-height: 200vh;
          scroll-snap-align: start;
        }
        .wing-pin {
          position: sticky;
          top: 0;
          min-height: 100svh;
          display: flex;
          align-items: center;
          padding: clamp(4rem, 8vw, 7rem) clamp(1.5rem, 6vw, 5rem);
          background: var(--wall);
        }
        .wing-pin > :global(.section-inner) {
          width: 100%;
        }
        .wing-i-overlap {
          margin-top: -60vh;
          background: transparent;
          position: relative;
          z-index: 1;
        }
        .wing-ii-overlap {
          margin-top: -50vh;
          background: transparent;
          position: relative;
          z-index: 2;
        }
        .wing-iii-overlap {
          margin-top: -60vh;
          background: transparent;
          position: relative;
          z-index: 3;
        }
        .wing-iv-overlap {
          margin-top: -60vh;
          background: transparent;
          position: relative;
          z-index: 4;
        }

        /* ---------- Per-wing scroll-driven reveal ----------
           Native CSS scroll-linked animation (no JS): each wing's content
           animates in as it scrolls into view, tied directly to scroll
           progress rather than a fixed duration. Each wing gets a
           distinct motion so the four transitions don't feel identical:
           Wing I zooms in, Wing II slides from the right, Wing III slides
           from the left, Wing IV blurs in. This sits alongside the
           existing AOS stagger on individual children — this animates
           the section as a whole, AOS still staggers what's inside it.
           Wrapped in @supports since browser support for
           animation-timeline: view() is still partial (Chrome/Edge only
           as of writing) — unsupported browsers just skip this layer and
           fall back to the AOS-only reveal, which works everywhere.
           Also skipped entirely under prefers-reduced-motion. */
        @supports (animation-timeline: view()) {
          @media (prefers-reduced-motion: no-preference) {
            :global(#wing-i .section-inner) {
              animation: wing-reveal-zoom linear both;
              animation-timeline: view();
              animation-range: entry 0% cover 35%;
            }
            :global(#wing-ii .section-inner) {
              animation: wing-reveal-from-right linear both;
              animation-timeline: view();
              animation-range: entry 0% cover 35%;
            }
            :global(#wing-iii .section-inner) {
              animation: wing-reveal-from-left linear both;
              animation-timeline: view();
              animation-range: entry 0% cover 35%;
            }
            :global(#wing-iv .section-inner) {
              animation: wing-reveal-blur linear both;
              animation-timeline: view();
              animation-range: entry 0% cover 29%;
            }
          }
        }
        @keyframes wing-reveal-zoom {
          from {
            opacity: 0;
            transform: scale(0.88);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes wing-reveal-from-right {
          from {
            opacity: 0;
            transform: translateX(70px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes wing-reveal-from-left {
          from {
            opacity: 0;
            transform: translateX(-70px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes wing-reveal-blur {
          from {
            opacity: 0;
            filter: blur(12px);
          }
          to {
            opacity: 1;
            filter: blur(0);
          }
        }

        h2 {
          // font-family: var(--font-display);
          font-family: "BBH Bartle", sans-serif;
          font-weight: 400;
          font-style: italic;
          font-size: clamp(2rem, 4vw, 2.8rem);
          margin: 0.6rem 0 2.2rem;
        }
        .p{
        }
        .works-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
        }
        .rooms-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 2rem;
        }
        .room {
          border-top: 1px solid var(--hairline);
          padding-top: 1.2rem;
        }
        .room-label {
          font-family: var(--font-mono);
          font-size: 0.68rem;
          color: var(--brass);
          letter-spacing: 0.1em;
        }
        .room h3 {
          font-family: var(--font-unbounded);
          // font-style: italic;
          font-size: 1.5rem;
          margin: 0.5rem 0 0.7rem;
        }
        .room p {
          color: var(--plaster-dim);
          line-height: 1.6;
          font-size: 0.94rem;
        }
        .artist p,
        p.visit {
          max-width: 34rem;
          color: var(--plaster-dim);
          line-height: 1.7;
          font-size: 1.02rem;
        }
        .visit-link {
          display: inline-block;
          margin-top: 1.4rem;
          font-family: var(--font-mono);
          font-size: 0.95rem;
          color: var(--brass-bright);
          border-bottom: 1px solid var(--brass);
          padding-bottom: 0.2rem;
        }
        .visit-link:hover {
          color: var(--plaster);
          border-color: var(--plaster);
        }
        @media (max-width: 720px) {
          .gallery {
            margin-left: 0;
          }
          /* Overlap math assumes real scroll runway per section; on short
             mobile viewports the pulls can get tight. Ease them off. */
          .wing-i-overlap {
            margin-top: -40vh;
          }
          .wing-ii-overlap,
          .wing-iii-overlap,
          .wing-iv-overlap {
            margin-top: -30vh;
          }
        }
      `}</style>
      </div>
    </>
  );
}
