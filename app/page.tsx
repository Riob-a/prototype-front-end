"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import AOS from "aos";
import WingNav from "@/components/WingNav";
import Placard from "@/components/Placard";
import DROLogo from "@/components/Logo";
import AnimatedLathe from "@/components/Experimental";
import ContactForm from "@/components/ContactForm";

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
    link: "https://derrick-55-ongwae.vercel.app/",
  },
  {
    catalogue: "CAT. 02",
    title: "Interior, Held Breath",
    medium: "Oil on canvas",
    year: "2024",
    note: "Warm underpainting left visible at the edges of the frame.",
    link: "https://derrick-55-ongwae.vercel.app/",
  },
  {
    catalogue: "CAT. 03",
    title: "Study in Reflection",
    medium: "Digital",
    year: "2025",
    note: "Built from layered brush passes rather than flat vector shapes.",
    link: "https://derrick-55-ongwae.vercel.app/",
  },
  {
    catalogue: "CAT. 04",
    title: "Fruit, Glass, Dust",
    medium: "Charcoal and pencil",
    year: "2023",
    note: "Returned to twice, a year apart, to correct the light.",
    link: "https://derrick-55-ongwae.vercel.app/",
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
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof document !== "undefined") {
      const current = document.documentElement.getAttribute("data-theme");

      if (current === "light" || current === "dark") {
        return current;
      }
    }

    return "dark";
  });

  const [mounted, setMounted] = useState(false);

  /*
   * Currently selected project for the iframe viewer.
   * null means the viewer is closed.
   */
  const [selectedProject, setSelectedProject] = useState<
    (typeof WORKS)[number] | null
  >(null);

  /*
   * Used to control the exit animation before removing
   * the iframe viewer from the DOM.
   */
  const [viewerClosing, setViewerClosing] = useState(false);

  /*
   * Mobile Wing I pagination.
   */
  const [currentWork, setCurrentWork] = useState(0);
  const [workDirection, setWorkDirection] = useState<1 | -1>(1);

  /*
   * Used for mobile swipe navigation.
   */
  const touchStartX = useRef<number | null>(null);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";

      document.documentElement.setAttribute("data-theme", next);
      window.localStorage.setItem("theme", next);

      return next;
    });
  };

  const updateLoadingProgress = (progress: number) => {
    const bar = document.getElementById("loader-progress-bar");
    const percentage = document.getElementById("loader-percentage");

    if (bar) {
      bar.style.width = `${progress}%`;
    }

    if (percentage) {
      percentage.textContent = `${Math.round(progress)}%`;
    }
  };

  const finishLoading = () => {
    const loader = document.getElementById("initial-loader");

    if (!loader) {
      setMounted(true);
      return;
    }

    loader.classList.add("loader-exiting");

    window.setTimeout(() => {
      loader.remove();
      setMounted(true);
    }, 700);
  };

  /*
   * Open the selected project.
   */
  const openProject = (project: (typeof WORKS)[number]) => {
    setViewerClosing(false);
    setSelectedProject(project);
  };

  /*
   * Close with an animation first, then remove the viewer.
   */
  const closeProject = () => {
    setViewerClosing(true);

    window.setTimeout(() => {
      setSelectedProject(null);
      setViewerClosing(false);
    }, 450);
  };

  /*
   * Mobile pagination.
   */
  const showNextWork = () => {
    setWorkDirection(1);

    setCurrentWork((prev) => {
      return (prev + 1) % WORKS.length;
    });
  };

  const showPreviousWork = () => {
    setWorkDirection(-1);

    setCurrentWork((prev) => {
      return (prev - 1 + WORKS.length) % WORKS.length;
    });
  };

  /*
   * Mobile swipe handling.
   */
  const handleWorkPointerDown = (event: React.PointerEvent) => {
    touchStartX.current = event.clientX;
  };

  const handleWorkPointerUp = (event: React.PointerEvent) => {
    if (touchStartX.current === null) {
      return;
    }

    const deltaX = event.clientX - touchStartX.current;

    if (Math.abs(deltaX) > 50) {
      if (deltaX < 0) {
        showNextWork();
      } else {
        showPreviousWork();
      }
    }

    touchStartX.current = null;
  };

  const handleWorkPointerCancel = () => {
    touchStartX.current = null;
  };

  /*
   * Disable page scrolling while the project viewer is open.
   *
   * The mobile pagination is unaffected because this only
   * changes the document body's overflow.
   */
  useEffect(() => {
    if (!selectedProject) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedProject]);

  /*
   * ESC closes the project viewer.
   */
  useEffect(() => {
    if (!selectedProject) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeProject();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedProject]);

  /*
   * Prevent the viewer from opening until the main page has mounted.
   */
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
      <div className={mounted ? "site-mounted" : "site-hidden"}>
        <WingNav />

        <main className="gallery">
          <section id="entrance" className="entrance-wrapper">
            <div className="entrance-pin">
              <div className="entrance-copy">
                <div className="name-logo" data-aos="fade-up">
                  <DROLogo
                    className="name-logo-icon"
                    color="var(--logo-color)"
                    size={42}
                  />
                  <span className="eyebrow">Derrick Ongwae</span>
                </div>

                <h1 data-aos="fade-right" data-aos-delay="150">
                  <span className="title-the">THE</span>
                  <em>center</em>
                </h1>

                <p
                  className="eyebrow-"
                  data-aos="fade-right"
                  data-aos-delay="300"
                >
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
                  onProgress={updateLoadingProgress}
                  onReady={finishLoading}
                />

                <span
                  className="plinth-label"
                  data-aos="fade-up"
                  data-aos-delay="320"
                >
                  Fig. 0 — Untitled (Kinetic Study), glass, ongoing
                </span>
              </div>
            </div>
          </section>

          {/* =========================================================
              WING I
              Desktop = 4-card grid
              Mobile = 1-card pagination
             ========================================================= */}

          <section id="wing-i" className="wing-runway wing-i-overlap">
            <div className="wing-pin">
              <div className="section-inner">
                <span className="eyebrow" data-aos="fade-up">
                  Wing I
                </span>

                <h2 data-aos="fade-up" data-aos-delay="100">
                  Recent works
                </h2>

                {/* -------------------------------------------------
                    DESKTOP GRID
                   ------------------------------------------------- */}

                <div className="works-grid works-grid-desktop">
                  {WORKS.map((w, i) => (
                    <button
                      type="button"
                      className="work-card-link"
                      key={w.catalogue}
                      onClick={() => openProject(w)}
                      data-aos="fade-up"
                      data-aos-delay={150 + i * 100}
                      aria-label={`Open ${w.title}`}
                    >
                      <Placard {...w} />
                    </button>
                  ))}
                </div>

                {/* -------------------------------------------------
                    MOBILE PAGINATION
                   ------------------------------------------------- */}

                <div className="works-pagination-mobile">
                  <div
                    className={`mobile-work-card ${
                      workDirection === 1
                        ? "mobile-work-slide-next"
                        : "mobile-work-slide-prev"
                    }`}
                    key={currentWork}
                    onPointerDown={handleWorkPointerDown}
                    onPointerUp={handleWorkPointerUp}
                    onPointerCancel={handleWorkPointerCancel}
                  >
                    <button
                      type="button"
                      className="work-card-link"
                      onClick={() => openProject(WORKS[currentWork])}
                      aria-label={`Open ${WORKS[currentWork].title}`}
                    >
                      <Placard {...WORKS[currentWork]} />
                    </button>
                  </div>

                  <div className="work-pagination-controls">
                    <button
                      type="button"
                      className="work-pagination-button"
                      onClick={showPreviousWork}
                      aria-label="Previous artwork"
                    >
                      ←
                    </button>

                    <div
                      className="work-pagination-count"
                      aria-live="polite"
                      aria-atomic="true"
                    >
                      <span>
                        {String(currentWork + 1).padStart(2, "0")}
                      </span>

                      <span className="work-pagination-divider">/</span>

                      <span>
                        {String(WORKS.length).padStart(2, "0")}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="work-pagination-button"
                      onClick={showNextWork}
                      aria-label="Next artwork"
                    >
                      →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

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

          <section id="wing-iv" className="wing-runway wing-iv-overlap">
            <div className="wing-pin">
              <div className="section-inner">
                <span className="eyebrow" data-aos="fade-up">
                  Wing IV
                </span>

                <h2 data-aos="fade-up" data-aos-delay="100">
                  Visit
                </h2>

                <p
                  className="visit"
                  data-aos="fade-up"
                  data-aos-delay="200"
                >
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

          <section id="wing-v" className="wing-runway wing-v-overlap">
            <div className="wing-pin">
              <div className="section-inner">
                <span className="eyebrow" data-aos="fade-up">
                  Wing V
                </span>

                <h2 data-aos="fade-up" data-aos-delay="100">
                  xperiment
                </h2>

                {/* <AnimatedLathe/> */}
                {/* <ContactForm/> */}
              </div>
            </div>
          </section>
        </main>

        {/* =========================================================
            PROJECT IFRAME VIEWER
           ========================================================= */}

        {selectedProject && (
          <div
            className={`project-viewer ${
              viewerClosing ? "project-viewer-closing" : ""
            }`}
            role="dialog"
            aria-modal="true"
            aria-label={`${selectedProject.title} project viewer`}
          >
            <div
              className="project-viewer-backdrop"
              onClick={closeProject}
              aria-hidden="true"
            />

            <div className="project-viewer-panel">
              <header className="project-viewer-header">
                <div className="project-viewer-heading">
                  <span className="project-viewer-catalogue">
                    {selectedProject.catalogue}
                  </span>

                  <span className="project-viewer-title">
                    {selectedProject.title}
                  </span>
                </div>

                <button
                  type="button"
                  className="project-close"
                  onClick={closeProject}
                  aria-label="Close project viewer"
                >
                  <span>CLOSE</span>
                  <span className="project-close-symbol">×</span>
                </button>
              </header>

              <div className="project-viewer-meta">
                <span>{selectedProject.medium}</span>
                <span>{selectedProject.year}</span>
              </div>

              <div className="project-iframe-container">
                <iframe
                  key={selectedProject.link}
                  src={selectedProject.link}
                  title={selectedProject.title}
                  className="project-iframe"
                  loading="eager"
                  allow="fullscreen"
                />
              </div>

              <footer className="project-viewer-footer">
                <span>{selectedProject.note}</span>

                <a
                  href={selectedProject.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="project-external-link"
                >
                  OPEN FULL PROJECT ↗
                </a>
              </footer>
            </div>
          </div>
        )}

        <style jsx>{`
          .gallery {
            margin-left: clamp(3.2rem, 4vw, 7.5rem);
          }

          .site-hidden {
            visibility: hidden;
          }

          .site-mounted {
            visibility: visible;
          }

          .name-logo {
            display: flex;
            align-items: center;
            gap: 0.3rem;
            color: var(--brass);
            transition: color 0.5s ease;
          }

          .name-logo-icon {
            width: 42px;
            height: 42px;
            flex-shrink: 0;
            color: var(--brass);
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
            font-family: "BBH Bartle", sans-serif;
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
            margin-top: -10vh;
            background: transparent;
            position: relative;
            z-index: 1;
          }

          .wing-ii-overlap {
            margin-top: -10vh;
            background: transparent;
            position: relative;
            z-index: 2;
          }

          .wing-iii-overlap {
            margin-top: -10vh;
            background: transparent;
            position: relative;
            z-index: 3;
          }

          .wing-iv-overlap {
            margin-top: -10vh;
            background: transparent;
            position: relative;
            z-index: 4;
          }

          .wing-v-overlap {
            margin-top: -10vh;
            background: transparent;
            position: relative;
            z-index: 5;
          }

          #wing-v .wing-pin {
            padding-top: 3rem;
            padding-bottom: 3rem;
          }

          #wing-v .section-inner {
            width: 100%;
            max-width: none;
          }

          :global(.experimental-stage) {
            width: 100%;
            height: 75vh;
            min-height: 10px;
            position: relative;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          :global(.experimental-stage canvas) {
            display: block;
            width: 80% !important;
            height: 80% !important;
            margin: auto;
          }

          /* =======================================================
             DESKTOP WORK GRID
             ======================================================= */

          .works-grid {
            display: grid;
            grid-template-columns: repeat(
              auto-fit,
              minmax(240px, 1fr)
            );
            gap: 1.5rem;
          }

          .works-pagination-mobile {
            display: none;
          }

          .work-card-link {
            appearance: none;
            border: 0;
            padding: 0;
            margin: 0;
            background: transparent;
            color: inherit;
            font: inherit;
            text-align: left;
            cursor: pointer;
            display: block;
            width: 100%;
          }

          .work-card-link:focus-visible {
            outline: 1px solid var(--brass);
            outline-offset: 8px;
          }

          /* =======================================================
             ROOMS
             ======================================================= */

          .rooms-grid {
            display: grid;
            grid-template-columns: repeat(
              auto-fit,
              minmax(220px, 1fr)
            );
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

          /* =======================================================
             WING REVEAL ANIMATIONS
             ======================================================= */

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
            font-family: "BBH Bartle", sans-serif;
            font-weight: 400;
            font-style: italic;
            font-size: clamp(2rem, 4vw, 2.8rem);
            margin: 0.6rem 0 2.2rem;
          }

          /* =======================================================
             PROJECT VIEWER
             ======================================================= */

          .project-viewer {
            position: fixed;
            inset: 0;
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: clamp(0.75rem, 3vw, 3rem);
            isolation: isolate;
            animation: project-viewer-in 0.45s ease-out both;
          }

          .project-viewer-closing {
            animation: project-viewer-out 0.45s ease-in both;
          }

          .project-viewer-backdrop {
            position: absolute;
            inset: 0;
            background: rgba(0, 0, 0, 0.78);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            z-index: -1;
          }

          .project-viewer-panel {
            position: relative;
            width: min(1500px, 100%);
            height: min(94svh, 1000px);
            display: flex;
            flex-direction: column;
            background: var(--wall);
            border: 1px solid var(--hairline);
            box-shadow:
              0 40px 120px rgba(0, 0, 0, 0.45),
              0 0 0 1px rgba(255, 255, 255, 0.02);
            overflow: hidden;
            animation: project-panel-in 0.55s
              cubic-bezier(0.22, 1, 0.36, 1) both;
          }

          .project-viewer-closing .project-viewer-panel {
            animation: project-panel-out 0.4s ease-in both;
          }

          .project-viewer-header {
            flex: 0 0 auto;
            min-height: 4.5rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1.5rem;
            padding: 0.8rem 1.2rem 0.8rem 1.4rem;
            border-bottom: 1px solid var(--hairline);
            background: var(--wall);
          }

          .project-viewer-heading {
            min-width: 0;
            display: flex;
            align-items: baseline;
            gap: 1rem;
          }

          .project-viewer-catalogue {
            flex-shrink: 0;
            font-family: var(--font-mono);
            font-size: 0.65rem;
            letter-spacing: 0.1em;
            color: var(--brass);
          }

          .project-viewer-title {
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-family: var(--font-unbounded);
            font-size: clamp(0.75rem, 1.5vw, 0.95rem);
            color: var(--plaster);
          }

          .project-close {
            flex-shrink: 0;
            display: inline-flex;
            align-items: center;
            gap: 0.6rem;
            border: 1px solid var(--hairline);
            background: transparent;
            color: var(--plaster-dim);
            padding: 0.65rem 0.75rem 0.65rem 0.9rem;
            cursor: pointer;
            font-family: var(--font-mono);
            font-size: 0.63rem;
            letter-spacing: 0.08em;
            transition:
              color 0.25s ease,
              border-color 0.25s ease,
              background 0.25s ease;
          }

          .project-close:hover {
            color: var(--plaster);
            border-color: var(--brass);
            background: rgba(255, 255, 255, 0.025);
          }

          .project-close:focus-visible {
            outline: 1px solid var(--brass);
            outline-offset: 4px;
          }

          .project-close-symbol {
            font-family: Arial, sans-serif;
            font-size: 1.25rem;
            line-height: 0.7;
            color: var(--brass);
          }

          .project-viewer-meta {
            flex: 0 0 auto;
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 0.55rem 1.4rem;
            border-bottom: 1px solid var(--hairline);
            font-family: var(--font-mono);
            font-size: 0.62rem;
            letter-spacing: 0.07em;
            text-transform: uppercase;
            color: var(--plaster-dim);
          }

          .project-viewer-meta span + span::before {
            content: "—";
            margin-right: 1rem;
            color: var(--hairline);
          }

          .project-iframe-container {
            position: relative;
            flex: 1 1 auto;
            min-height: 0;
            background: #000;
            overflow: hidden;
          }

          .project-iframe {
            display: block;
            width: 100%;
            height: 100%;
            border: 0;
            background: #fff;
          }

          .project-viewer-footer {
            flex: 0 0 auto;
            min-height: 3.4rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1.5rem;
            padding: 0.7rem 1.4rem;
            border-top: 1px solid var(--hairline);
            background: var(--wall);
          }

          .project-viewer-footer > span {
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-family: var(--font-mono);
            font-size: 0.62rem;
            letter-spacing: 0.03em;
            color: var(--plaster-dim);
          }

          .project-external-link {
            flex-shrink: 0;
            font-family: var(--font-mono);
            font-size: 0.62rem;
            letter-spacing: 0.08em;
            color: var(--brass-bright);
            text-decoration: none;
            border-bottom: 1px solid var(--brass);
            padding-bottom: 0.15rem;
            transition:
              color 0.25s ease,
              border-color 0.25s ease;
          }

          .project-external-link:hover {
            color: var(--plaster);
            border-color: var(--plaster);
          }

          @keyframes project-viewer-in {
            from {
              opacity: 0;
            }

            to {
              opacity: 1;
            }
          }

          @keyframes project-viewer-out {
            from {
              opacity: 1;
            }

            to {
              opacity: 0;
            }
          }

          @keyframes project-panel-in {
            from {
              opacity: 0;
              transform: translateY(30px) scale(0.97);
              filter: blur(5px);
            }

            to {
              opacity: 1;
              transform: translateY(0) scale(1);
              filter: blur(0);
            }
          }

          @keyframes project-panel-out {
            from {
              opacity: 1;
              transform: translateY(0) scale(1);
              filter: blur(0);
            }

            to {
              opacity: 0;
              transform: translateY(20px) scale(0.98);
              filter: blur(4px);
            }
          }

          /* =======================================================
             MOBILE
             ======================================================= */

          @media (max-width: 720px) {
            .gallery {
              margin-left: 0;
            }

            #wing-i {
              margin-top: 0;
              position: relative;
              z-index: 1;
            }

            /*
             * Wing I is no longer internally scrollable.
             * The entire section fits inside the mobile viewport.
             */
            #wing-i .wing-pin {
              position: sticky;
              top: 0;
              height: 100svh;
              min-height: 0;
              overflow: hidden;
              box-sizing: border-box;
              padding: 2rem 1.5rem;
            }

            #wing-i .section-inner {
              width: 100%;
              min-height: 0;
            }

            #wing-i h2 {
              margin-bottom: 1.2rem;
            }

            /*
             * Hide desktop 4-card grid.
             */
            .works-grid-desktop {
              display: none;
            }

            /*
             * Show mobile pagination.
             */
            .works-pagination-mobile {
              display: flex;
              flex-direction: column;
              width: 100%;
            }

            /*
             * Single mobile artwork.
             */
            .mobile-work-card {
              width: 100%;
              min-height: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              touch-action: pan-y;
              user-select: none;
              -webkit-user-select: none;
            }

            .mobile-work-card .work-card-link {
              width: min(100%, 360px);
            }

            /*
             * Next = enters from right.
             */
            .mobile-work-slide-next {
              animation: mobile-work-next 0.42s
                cubic-bezier(0.22, 1, 0.36, 1) both;
            }

            /*
             * Previous = enters from left.
             */
            .mobile-work-slide-prev {
              animation: mobile-work-prev 0.42s
                cubic-bezier(0.22, 1, 0.36, 1) both;
            }

            @keyframes mobile-work-next {
              from {
                opacity: 0;
                transform: translateX(45px);
              }

              to {
                opacity: 1;
                transform: translateX(0);
              }
            }

            @keyframes mobile-work-prev {
              from {
                opacity: 0;
                transform: translateX(-45px);
              }

              to {
                opacity: 1;
                transform: translateX(0);
              }
            }

            /*
             * Pagination controls.
             */
            .work-pagination-controls {
              display: flex;
              align-items: center;
              justify-content: space-between;
              width: 100%;
              margin-top: 1rem;
              padding-top: 0.8rem;
              border-top: 1px solid var(--hairline);
            }

            .work-pagination-button {
              appearance: none;
              width: 2.8rem;
              height: 2.8rem;
              display: flex;
              align-items: center;
              justify-content: center;
              border: 1px solid var(--hairline);
              background: transparent;
              color: var(--plaster);
              font-family: var(--font-mono);
              font-size: 1rem;
              cursor: pointer;
              transition:
                color 0.25s ease,
                border-color 0.25s ease,
                background 0.25s ease,
                transform 0.25s ease;
            }

            .work-pagination-button:hover {
              color: var(--brass-bright);
              border-color: var(--brass);
              background: rgba(255, 255, 255, 0.025);
            }

            .work-pagination-button:active {
              transform: scale(0.92);
            }

            .work-pagination-button:focus-visible {
              outline: 1px solid var(--brass);
              outline-offset: 4px;
            }

            .work-pagination-count {
              display: flex;
              align-items: center;
              gap: 0.55rem;
              font-family: var(--font-mono);
              font-size: 0.7rem;
              letter-spacing: 0.12em;
              color: var(--plaster-dim);
            }

            .work-pagination-count span:first-child {
              color: var(--brass-bright);
            }

            .work-pagination-divider {
              color: var(--hairline);
            }

            .wing-ii-overlap {
              margin-top: 0;
            }

            .wing-iii-overlap,
            .wing-iv-overlap {
              margin-top: -10vh;
            }

            /*
             * Mobile iframe viewer remains full-screen.
             */
            .project-viewer {
              padding: 0;
              align-items: stretch;
              justify-content: stretch;
            }

            .project-viewer-panel {
              width: 100%;
              height: 100svh;
              max-height: none;
              border: 0;
              border-radius: 0;
            }

            .project-viewer-header {
              min-height: 4rem;
              padding:
                max(0.65rem, env(safe-area-inset-top))
                0.8rem
                0.65rem
                1rem;
            }

            .project-viewer-heading {
              gap: 0.65rem;
            }

            .project-viewer-catalogue {
              font-size: 0.58rem;
            }

            .project-viewer-title {
              font-size: 0.7rem;
            }

            .project-close {
              padding: 0.65rem;
            }

            .project-close span:first-child {
              display: none;
            }

            .project-close-symbol {
              font-size: 1.35rem;
            }

            .project-viewer-meta {
              padding: 0.5rem 1rem;
              font-size: 0.56rem;
            }

            .project-viewer-footer {
              padding:
                0.6rem
                1rem
                max(0.6rem, env(safe-area-inset-bottom))
                1rem;
              gap: 1rem;
            }

            .project-viewer-footer > span {
              display: none;
            }

            .project-external-link {
              margin-left: auto;
            }

            .project-iframe-container {
              min-height: 0;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .project-viewer,
            .project-viewer-panel,
            .project-viewer-closing .project-viewer-panel,
            .mobile-work-slide-next,
            .mobile-work-slide-prev {
              animation: none;
            }
          }
        `}</style>
      </div>
    </>
  );
}