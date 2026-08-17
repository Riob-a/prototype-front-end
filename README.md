# the GALLERY

A single-page Next.js portfolio for Derrick Ongwae. One scrolling room, four
"wings" (Works, Media, Artist, Visit), with a kinetic metallic sculpture at
the entrance built with React Three Fiber and React Spring.

## Design

- **Palette**: near-black gallery wall (`#0F0D0C`), warm plaster white,
  brass accent, a deep oxide-red undertone — a museum-at-dusk feel rather
  than a bright portfolio template.
- **Type**: Fraunces (display/italic), Work Sans (body), Space Mono
  (catalogue numbers and labels, like real museum placards).
- **Signature piece**: the entrance sculpture — an icosahedron with a
  metallic material, spring-physics scale on hover/click, slow ambient
  rotation. Click it to "activate" a larger, faster spin.
- **Navigation**: a fixed left-hand "wing directory" that scrolls to each
  section, styled like a gallery floor plan.

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Build for production

```bash
npm run build
npm start
```

## Where to edit

- `app/page.tsx` — all section content (works list, media rooms, about,
  contact). Edit the `WORKS` and `ROOMS` arrays to swap in your real pieces.
- `components/Sculpture.tsx` — the 3D entrance piece (material, lighting,
  spring physics).
- `components/Placard.tsx` — the museum-label card used for each work.
  Swap the placeholder `.frame` div for a real `<Image>` once you have
  photos of the pieces.
- `app/globals.css` — the design tokens (`:root` CSS variables) driving
  color and type across the whole site.

## Notes

- The 3D canvas is loaded with `next/dynamic` and `ssr: false` since WebGL
  needs the browser — don't remove that when editing `page.tsx`.
- Fonts load from Google Fonts at build time via `next/font/google`; this
  needs network access during `next build` / `next dev`.
- Replace the placeholder `mailto:` link and artwork images with your own
  before shipping.
