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
  title: "CENTER — Derrick Ongwae",
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
        {/* BBH Bartle */}
        <link
          href="https://fonts.googleapis.com/css2?family=BBH+Bartle&display=swap"
          rel="stylesheet"
        />

        {/* Set theme before first paint */}
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

                  document.documentElement.setAttribute(
                    "data-theme",
                    theme
                  );
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>

      <body
        className={`${fraunces.variable} ${workSans.variable} ${spaceMono.variable} ${unbounded.variable}`}
      >
        {/* INITIAL LOADER
            This exists before React hydrates, preventing the
            incorrect first-frame flash on Ctrl+R. */}
        <div id="initial-loader" className="initial-loader">
          <div className="initial-loader-content">
            <span>THE</span>
            <strong>GALLERY</strong>

            <div className="loader-progress">
              <div
                id="loader-progress-bar"
                className="loader-progress-bar"
              />
            </div>

            <div
              id="loader-percentage"
              className="loader-percentage"
            >
              0%
            </div>
          </div>
        </div>

        {children}
      </body>
    </html>
  );
}