# Suyash Agarwal — Developer portfolio

A responsive portfolio built with React, TypeScript, Vite, Tailwind CSS 4, shadcn/ui, GSAP, and Three.js.

**Live site:** https://portfolio-red-psi-efy7pib5tx.vercel.app/

## Run locally

Use Node.js 22.12+ or a compatible newer version.

```sh
npm ci
npm run dev
```

```sh
npm run build
npm run preview
npm run lint
```

## Experience

- A cloud welcome scene with interactive particle lettering, using the same navy, lavender and mint palette as the main portfolio. It appears on a fresh visit; the `sa.` logo reopens it.
- A water-bubble hero with code, React, JavaScript, SQL and a pixel-cat. Click, tap or press Enter to change symbols. Pause motion freezes animation without disabling symbol selection.
- Animated project cards, a three-page introduction notebook, and a Three.js skills laptop with accessible technology buttons.
- Moog City by C418 streamed using the official SoundCloud widget. Music controls support play/pause, volume and remembered preference. Browsers may require an initial interaction to play audio.
- Responsive layouts, keyboard controls and reduced-motion support.

## Customize

| File | Content |
| --- | --- |
| `src/data.ts` | Projects, skills, profile links and contact details |
| `src/App.tsx` | Main sections, achievements and hero copy |
| `components/ui/welcome-intro.tsx` | Welcome copy and entry flow |
| `components/ui/cloud-name.tsx` | Particle lettering and colours |
| `src/welcome-theme.css` | Shared welcome/hero palette and entry styling |
| `src/theme.css` | Main section theme |
| `components/ui/intro-notebook.tsx` | Notebook pages and quotes |
| `components/ui/3d-animation.tsx` | Water bubbles and developer symbols |
| `components/ui/animated-projects.tsx` | Animated project cards |
| `components/ui/skills-laptop.tsx` | Technology descriptions |
| `components/ui/music-player.tsx` | Official SoundCloud player and controls |
| `public/Suyash-Agarwal-Resume.pdf` | Downloadable resume |

Reusable components live in root-level `components/ui/`. The `@/*` alias resolves from the project root. Main Tailwind styles live in `src/index.css`; section styles are imported by `src/App.tsx`. `components.json` provides the shadcn configuration.

The supplied cloud artwork is kept in `public/ascii-clouds.png`. No music recording is stored in this repository. The optional original carousel remains in `components/ui/liquid-carousel.tsx`.

## Deployment

Vercel uses the checked-in `vercel.json`: `npm ci`, `npm run build`, output directory `dist`. The site expects the root of a domain. After importing the repository into Vercel, keep these settings and deploy the `main` branch.

Local Vercel account metadata, credentials, environment files, build output and dependencies are excluded from Git. No environment variables are required for the public portfolio.
