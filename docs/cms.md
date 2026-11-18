# Website CMS

Every public page, the navigation and the footer are edited in Payload at `/admin`. The structure follows the Taxful project: one editor per fixed page, shared section layouts, and Navbar and Footer globals under **Site settings**.

## Admin sidebar

| Group         | Contents                                                                                                        |
| ------------- | --------------------------------------------------------------------------------------------------------------- |
| Pages         | Service pages (collection), Home, Services overview, Packages & pricing, About us, How we work, FAQ, Contact, Legal notice (Impressum), Privacy policy, Terms and conditions (AGB) |
| Media         | Media library                                                                                                   |
| Shop, Admin   | Customers, admins                                                                                               |
| Site settings | Navigation, Footer                                                                                              |

Groups are defined in `ADMIN_GROUPS` (`src/lib/cms.ts`). Payload lists groups that contain collections first, so the order of `collections` in `src/payload.config.ts` sets the order. Every page, including service pages, has the same tabs: **Heading** (Home: **Hero**), **Content** and **SEO**.

## Editing on a phone

The admin works at phone width. Dashboard cards are compact, inputs use 16 px text so iOS does not zoom in, row buttons have larger touch targets (`src/app/(payload)/custom.scss`), and sections and content items are labelled by their title or type so collapsed lists stay readable.

## Pages and routes

Each page has its own route folder under `src/app/(frontend)/[locale]/` and its own global with the same model. Paths get the `/de` or `/en` prefix automatically.

| Page                 | Global              | Path            |
| -------------------- | ------------------- | --------------- |
| Home                 | `home`              | `/`             |
| Services overview    | `services-overview` | `/services`     |
| Service pages        | `services` (collection) | `/services/<slug>` |
| Packages & pricing   | `pricing`           | `/pricing`      |
| About us             | `about`             | `/about`        |
| How we work          | `how-it-works`      | `/how-it-works` |
| FAQ                  | `faq`               | `/faq`          |
| Contact              | `contact`           | `/contact`      |
| Legal notice         | `impressum`         | `/impressum`    |
| Privacy policy       | `privacy`           | `/privacy`      |
| Terms and conditions | `terms`             | `/terms`        |

To add a fixed page: add it to `websitePages` in `src/lib/pages.ts`, add a route folder with a `page.tsx` like `about/page.tsx`, then create and apply a migration (see `CLAUDE.md`). The page then appears in the admin, in the link picker and on the website.

An unpublished page returns 404, except Home, which shows a short placeholder from `messages/*.json` until it is published.

## Editing a page

1. Choose the language with the locale selector. German is the default; English falls back to German.
2. **Heading**: eyebrow, page title (H1), subtitle and up to two buttons. On Home this tab is called **Hero**: the final hero design is still a placeholder (`src/components/site/hero.tsx`), but it already shows these texts, and the new design will keep using them.
3. **Content**: add sections and choose **100%**, **50% / 50%** or **33% / 33% / 33%**. Each column holds content items:
   - **Rich text**: headings H2–H4, lists, quotes, bold, italic, links. Local links like `/about` get the language prefix.
   - **Image** from the media library, with original, 4:3 or square crop and a caption.
   - **Cards**: short highlights, optionally numbered for process steps.
   - **FAQ**: expandable questions, also published as schema.org `FAQPage` data.
   - **Service cards**: chosen service pages, or all published ones when left empty.
   - **Buttons**: up to three links styled as primary or secondary buttons.
4. **SEO**: optional title, description, sharing image and "hide from search engines". Canonical and `de`/`en` alternate URLs are generated.
5. **Save draft** while editing, then **Publish**. The last 25 versions are kept. Published changes show on the next page load.

Sections belong to one language: English sections are separate from German ones. Until English sections exist, English pages show the German sections.

## Links

Every link (navbar, footer, buttons) chooses one of:

- **Website page**: picked from the list of fixed pages.
- **Service page**: picked from the service pages collection; follows slug changes.
- **Other path**: a local path such as `/contact#form`, without `/de` or `/en`.
- **External URL**: `https://` or `http://` only.

Unsafe or incomplete links are rejected on save and never rendered (`src/lib/links.ts`).

## Navigation and footer

- **Navigation**: optional logo (otherwise the text "AI Vision"), up to eight items. An item is a link (text or call-to-action button) or a dropdown with up to twelve links and short descriptions. The language switcher is added automatically.
- **Footer**: logo (falls back to the navigation logo), tagline, contact details, up to four link columns, social profiles, copyright (`{year}` becomes the current year) and legal links. Empty parts are hidden.

## Speed

- Pages are rendered once on their first visit and then served as cached HTML (ISR), without database queries. Nothing is prerendered at build time, so `pnpm build` needs no database.
- All CMS reads use one cache tag (`src/lib/website/load.ts`, `src/lib/website/cache.ts`). Publishing or unpublishing a page, service, navbar, footer or image expires it (`src/hooks/revalidate.ts`), so the next visitor gets fresh content. Draft saves do not. Pages also refresh at least once a day.
- In `pnpm dev`, pages always render fresh.

## Images

- Upload PNG, JPEG, WebP or SVG. Other files, and SVGs with scripts or embedded content, are rejected.
- PNG and JPEG are converted to **WebP** on upload and only the WebP is stored (quality 82, transparency kept). Photos larger than 2560 px are scaled down; metadata such as GPS location is removed.
- Every raster image also gets WebP sizes of 400, 768 and 1600 px. The website uses them in `srcset`, so the browser downloads the smallest size that fits and the server never resizes images per request.
- SVG is stored unchanged and used for logos and icons.
- Files are served with `nosniff`, a sandboxing `Content-Security-Policy` and a one-day browser cache (`src/lib/media.ts`).
- Settings: `src/lib/media.ts`. Tests: `tests/int/media.int.spec.ts`.

## Access

- Visitors read published content only. Drafts (`?draft=true`) and version history are refused.
- Only admin `users` can create, edit, publish or delete. Customers have no write access. Admins have a required first and last name.
- Rules: `publishedOrAdmin` and `isAdmin` in `src/access/`, draft guard in `src/hooks/protect-drafts.ts`. Tests: `tests/int/content.int.spec.ts`, `tests/int/links.int.spec.ts`, `tests/int/media.int.spec.ts`.

## Starter content

```bash
pnpm content:seed
```

Publishes bilingual starter content: six service pages, every page, the navigation and the footer. Each area is seeded only while it has no content, so running it again changes nothing. No prices, contact details or legal texts are invented. The legal pages and the contact block contain marked placeholders, and the legal pages are hidden from search engines. Replace them before launch.

## Code

| Area             | Location                                                       |
| ---------------- | -------------------------------------------------------------- |
| Page list        | `src/lib/pages.ts`                                             |
| Globals          | `src/globals/pages.ts`, `Navbar.ts`, `Footer.ts`               |
| Service pages    | `src/collections/Services.ts`                                  |
| Fields           | `src/fields/` (link, heading, SEO, content items, slug)        |
| Section layouts  | `src/blocks/layouts.ts`                                        |
| Data loading     | `src/lib/website/load.ts` (published only, cached)             |
| Cache refresh    | `src/hooks/revalidate.ts`                                      |
| Media            | `src/collections/Media.ts`, `src/lib/media.ts`                 |
| Components       | `src/components/site/`                                         |
| Seed             | `scripts/seed-content.ts`, `scripts/seed/`                     |
