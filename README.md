## JABS

Just Another Blog Site, a modified version of the AstroPaper theme created by [Sat Naing](https://satnaing.dev) featured on [Astro](https://astro.build)'s [Theme](https://astro.build/themes/) page.

## Project Structure

```bash
/
├── public/
│   ├── assets/
│   │   └── logo.svg
│   │   └── logo.png
│   └── favicon.svg
│   └── astropaper-og.jpg
│   └── robots.txt
│   └── toggle-theme.js
├── src/
│   ├── assets/
│   │   └── socialIcons.ts
│   ├── components/
│   ├── content/
│   │   |  blog/
│   │   |    └── some-blog-posts.md
│   │   └── config.ts
│   ├── layouts/
│   └── pages/
│   └── styles/
│   └── utils/
│   └── config.ts
│   └── types.ts
└── package.json
```

Any static assets, like images, can be placed in the `public/` directory.

All blog posts are stored in `src/content/blog` directory.

## Commands

All commands are run from the root of the project, from a terminal:

| Command                | Action                                                                                                                           |
| :--------------------- | :------------------------------------------------------------------------------------------------------------------------------- |
| `npm install`          | Installs dependencies                                                                                                            |
| `npm run dev`          | Starts local dev server at `localhost:4321`                                                                                      |
| `npm run build`        | Build your production site to `./dist/`                                                                                          |
| `npm run preview`      | Preview your build locally, before deploying                                                                                     |
| `npm run format:check` | Check code format with Prettier                                                                                                  |
| `npm run format`       | Format codes with Prettier                                                                                                       |
| `npm run sync`         | Generates TypeScript types for all Astro modules. [Learn more](https://docs.astro.build/en/reference/cli-reference/#astro-sync). |
| `npm run cz`           | Commit code changes with commitizen                                                                                              |
| `npm run lint`         | Lint with ESLint                                                                                                                 |

> Warning! Windows PowerShell users may need to install the [concurrently package](https://www.npmjs.com/package/concurrently) if they want to [run diagnostics](https://docs.astro.build/en/reference/cli-reference/#astro-check) during development (`astro check --watch & astro dev`). For more info, see [this issue](https://github.com/satnaing/astro-paper/issues/113).

## 📜 License

Licensed under the MIT License, Copyright © 2023

---

Made with 🤍 by [Sat Naing](https://satnaing.dev) 👨🏻‍💻 and [contributors](https://github.com/satnaing/astro-paper/graphs/contributors).
