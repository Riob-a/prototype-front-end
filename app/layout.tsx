import type { Metadata } from "next";
import { Fraunces, Work_Sans, Space_Mono, Unbounded } from "next/font/google";
import "aos/dist/aos.css";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  style: ["normal", "italic"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500"],
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "700"],
  display: "swap",
});

const unbounded = Unbounded({
  subsets: ["latin"],
  variable: "--font-unbounded",
});

export const metadata: Metadata = {
  title: "the GALLERY — Derrick Ongwae",
  description:
    "A single room, four wings. Pencil, paint, digital, and still life work by Derrick Ongwae.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* BBH Bartle isn't in next/font/google's bundled snapshot yet,
            so it's loaded the manual way instead. Reference it in CSS
            as font-family: 'BBH Bartle', sans-serif; — it has no
            .variable, since it never goes through next/font. */}
        <link
          href="https://fonts.googleapis.com/css2?family=BBH+Bartle&display=swap"
          rel="stylesheet"
        />
        {/* Runs before hydration, before first paint. Reads the saved
            theme (or falls back to the OS preference) and sets it
            directly, so the page never briefly flashes the wrong theme
            while React boots up and page.tsx's own effect catches up. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var stored = window.localStorage.getItem("theme");
                  var theme =
                    stored === "light" || stored === "dark"
                      ? stored
                      : window.matchMedia("(prefers-color-scheme: light)").matches
                      ? "light"
                      : "dark";
                  document.documentElement.setAttribute("data-theme", theme);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${fraunces.variable} ${workSans.variable} ${spaceMono.variable} ${unbounded.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
