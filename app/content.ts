/*
 * All visible copy for the site lives here.
 *
 * USE_PLACEHOLDERS = true  -> prototype / wireframe text everywhere
 * USE_PLACEHOLDERS = false -> your real copy (kept below, untouched)
 *
 * Artwork links stay real in both modes so the project viewer still works.
 */
export const USE_PLACEHOLDERS = true;

/* ------------------------------------------------------------------ */
/* REAL COPY                                                           */
/* ------------------------------------------------------------------ */

const REAL = {
  copy: {
    navMark: "CENTER",
    nav: [
      "Entrance",
      "Wing I — Works",
      "Wing II — Media",
      "Wing III — Artist",
      "Wing IV — Visit",
      "Wing V — Experimental",
    ],
    brand: "Derrick R Ongwae",
    titleThe: "THE",
    titleMain: "center",
    lede: "One room, four wings. Pencil, paint, digital, and still life — worked on in whichever order the subject demands. Turn the piece at the centre; it turns back.",
    plinth: "Fig. 0 — Untitled (Kinetic Study), glass, ongoing",
    wing1: { eyebrow: "Wing I", title: "Recent works" },
    wing2: { eyebrow: "Wing II", title: "The four rooms" },
    wing3: {
      eyebrow: "Wing III",
      title: "About the artist",
      body: "Derrick works across pencil, paint, and digital media, most often returning to still life as a way of re-examining how light sits on ordinary objects. Outside the studio, he builds the software this gallery runs on — including the sculpture you can turn at the entrance.",
    },
    wing4: {
      eyebrow: "Wing IV",
      title: "Visit",
      body: "For commissions, exhibitions, or a closer look at any piece, reach out directly.",
      email: "hello@derrickongwae.com",
    },
    wing5: { eyebrow: "Wing V", title: "xp-riment" },
  },
  works: [
    {
      catalogue: "CAT. 01",
      title: "The Gallery",
      medium: "JScript",
      year: "2025",
      note: "Art Portfolio Page. Still a work in Progress",
      link: "https://derrick-55-ongwae.vercel.app/",
    },
    {
      catalogue: "CAT. 02",
      title: "Interior, Held Breath",
      medium: "Oil on canvas",
      year: "2024",
      note: "Warm underpainting left visible at the edges of the frame.",
      link: "https://portfolio-five-five.vercel.app/",
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
  ],
  rooms: [
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
  ],
};

/* ------------------------------------------------------------------ */
/* PLACEHOLDER COPY (prototype)                                        */
/* ------------------------------------------------------------------ */

const LOREM_SHORT = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";
const LOREM_MEDIUM =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
const LOREM_LONG =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";

const PLACEHOLDER: typeof REAL = {
  copy: {
    navMark: "LOGO",
    nav: [
      "Nav item 00",
      "Nav item 01",
      "Nav item 02",
      "Nav item 03",
      "Nav item 04",
      "Nav item 05",
    ],
    brand: "Artist Name",
    titleThe: "SITE",
    titleMain: "title",
    lede: LOREM_MEDIUM,
    plinth: "Fig. 0 — Caption placeholder",
    wing1: { eyebrow: "Section 01", title: "Section heading" },
    wing2: { eyebrow: "Section 02", title: "Section heading" },
    wing3: {
      eyebrow: "Section 03",
      title: "Section heading",
      body: LOREM_LONG,
    },
    wing4: {
      eyebrow: "Section 04",
      title: "Section heading",
      body: LOREM_SHORT,
      email: "name@example.com",
    },
    wing5: { eyebrow: "Section 05", title: "Section heading" },
  },
  works: REAL.works.map((w, i) => ({
    catalogue: `CAT. 0${i + 1}`,
    title: "Artwork title",
    medium: "Medium",
    year: "0000",
    note: LOREM_SHORT,
    link: w.link,
  })),
  rooms: ["A", "B", "C", "D"].map((letter) => ({
    label: `Room ${letter}`,
    title: "Category",
    copy: LOREM_SHORT,
  })),
};

const ACTIVE = USE_PLACEHOLDERS ? PLACEHOLDER : REAL;

export const COPY = ACTIVE.copy;
export const WORKS = ACTIVE.works;
export const ROOMS = ACTIVE.rooms;
export type Work = (typeof WORKS)[number];
