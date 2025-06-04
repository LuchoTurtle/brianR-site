# DJ Brian Rodrigues - Professional Wedding & Event DJ Website

A modern, accessible, and responsive website for DJ Brian Rodrigues.

Built with Astro and Three.js.

![DJ Brian Rodrigues Website](https://github.com/user-attachments/assets/0fed2c32-4a18-4ea2-b663-caeed7177ae8)

## 📁 Project Structure

```
brianR-site/
├── public/                     # Static assets
│   ├── favicon.svg
│   ├── og-image.jpg
│   └── manifest.webmanifest
├── src/
│   ├── assets/                 # Images and media
│   │   ├── gallery/           # Event photos
│   │   ├── basic.jpeg         # Package images
│   │   ├── premium.jpeg
│   │   ├── super.jpeg
│   │   └── deluxe.jpeg
│   ├── components/            # Reusable components
│   │   ├── AboutSection.astro
│   │   ├── ContactSection.astro
│   │   ├── GallerySection.astro
│   │   ├── PackagesSection.astro
│   │   ├── ReviewsSection.astro
│   │   ├── ThemeToggle.astro
│   │   └── scene/             # Three.js components
│   │       ├── Scene.astro
│   │       ├── SceneManager.ts
│   │       ├── CircleMesh.ts
│   │       ├── LightSource.ts
│   │       ├── ParticleSystem.ts
│   │       └── utils.ts
│   ├── layouts/
│   │   └── Layout.astro       # Base layout with SEO
│   ├── pages/
│   │   ├── index.astro        # Homepage
│   │   └── 404.astro          # Custom error page
│   └── styles/
│       └── global.css         # Global styles and theme
├── astro.config.mjs           # Astro configuration
├── tailwind.config.mjs        # Tailwind configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Dependencies and scripts
```

## 🧞 Commands

All commands are run from the root of the project:

| Command                | Action                                           |
| :--------------------- | :----------------------------------------------- |
| `pnpm install`         | Install dependencies                             |
| `pnpm dev`             | Start development server at `localhost:4321`    |
| `pnpm build`           | Build production site to `./dist/`              |
| `pnpm preview`         | Preview production build locally                 |
| `pnpm lint`            | Lint code with ESLint                          |
| `pnpm lint:fix`        | Fix linting issues automatically               |
| `pnpm format`          | Format code with Prettier                      |
| `pnpm format:check`    | Check code formatting                           |

## 🚀 Deployment

This site is optimized for static hosting platforms:

1. **Build the site:**
   ```bash
   pnpm build
   ```

2. **Deploy the `dist/` folder to your preferred platform:**
   - [Netlify](https://netlify.com)
   - [Vercel](https://vercel.com)
   - [GitHub Pages](https://pages.github.com)
   - [Cloudflare Pages](https://pages.cloudflare.com)

## 📄 License

MIT License (MIT) - see the [LICENSE](LICENSE) file for details.