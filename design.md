# Rheino design system

Rheino is a software and AI studio in Cologne. The website helps small businesses explore services, understand what they include, and either configure an order or start a conversation. The Rhine and Cologne skyline give the marketing pages a recognizable setting. Pricing, order forms, and the account portal use quieter surfaces so the next action and account status are easy to find.

## Foundations

Use the semantic color tokens exposed through Tailwind. The theme follows the visitor’s system setting until they choose light or dark in the navigation.

| Token                | Light     | Dark      | Use                                       |
| -------------------- | --------- | --------- | ----------------------------------------- |
| `background`         | `#FBFAF8` | `#0F1110` | Page canvas                               |
| `foreground`         | `#171A16` | `#ECEEE9` | Headings and body text                    |
| `muted`              | `#5D6259` | `#A2A79E` | Supporting text                           |
| `primary`            | `#2A6A59` | `#7CC4AC` | Main actions, links, and focus outlines   |
| `primary-foreground` | `#FFFFFF` | `#0B1A14` | Text on primary buttons                   |
| `surface`            | `#FFFFFF` | `#171A18` | Cards, forms, and panels                  |
| `border`             | `#E4E2DB` | `#272B28` | Dividers and card outlines                |
| `accent`             | `#E7F0EC` | `#1A2924` | Highlighted sections and selected content |
| `--error-text`       | `#A12C24` | `#E77D70` | Validation and error messages             |

The hero has its own tokens for ink, connector strokes, glass, and the landscape overlay. Use those over the Rhine imagery. [Color tokens](<src/app/(frontend)/globals.css>)

- **Typography.** Use the system sans-serif stack for page headings, body text, and controls. The hero wordmark and service titles use italic Didot with Bodoni MT and Georgia fallbacks. The homepage eyebrow uses spaced, uppercase monospace. CMS rich text has a maximum width of `70ch`.
- **Layout.** Standard pages use a centered `max-w-6xl` container with 16 px gutters, increasing to 24 px at the small breakpoint. Home and service heroes run edge to edge, with body content returning to the standard container. CMS sections stack on phones and expand to two columns at the medium breakpoint or three at the large breakpoint.
- **Surfaces.** Use plain sections for the normal reading flow, bordered surfaces for grouped content, and accent sections for emphasis. Cards use rounded corners and thin borders. Shared marketing buttons are pill-shaped, with a filled primary style and a bordered secondary style.
- **Imagery and icons.** Use the Rheino skyline mark for the brand. The hero landscape has separate wide and phone crops. Use the CMS media library for page photography and the existing site icons for service or feature cards. Decorative artwork and connector graphics are hidden from assistive technology.

## Page patterns

| Area                 | Visual and interaction pattern                                                                                                                                                                                                                         |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Navigation           | The sticky bar is clear over a hero or landscape band at the top of the page. It becomes frosted on scroll. The compact layout puts navigation and account actions in a menu.                                                                          |
| Home                 | The Rheino wordmark sits at the center of the animated Rhine scene. Published services appear as linked glass pills. Curved lines, dots, and moving light trails connect each pill to the wordmark.                                                    |
| Service detail       | The service title is the visible H1 at the center of a feature map over the still Rhine landscape. Branch labels are plain text. On phones, the branches sit above and below the title. The summary, primary action, and CMS sections follow the hero. |
| Marketing and legal  | Services overview, pricing, about, how we work, FAQ, and contact use a faint Rhine band behind a standard heading. Legal pages use the standard heading on a plain canvas.                                                                             |
| Pricing and ordering | Cards show packages and direct visitors to the appropriate next action. The configurator pairs package options with a sticky preview and order summary on desktop. A bottom action bar keeps the total and next action visible on phones.              |
| Customer account     | Use clear page titles, labeled form controls, and explicit payment and order statuses. Keep account, order, and security actions in the existing portal patterns.                                                                                      |

## Content and interaction

- German uses unprefixed URLs. English uses `/en`. Allow room for long translations in headings, controls, and navigation. Use the existing locale-aware links for internal destinations.
- Edit service branches under **Service pages → Heading → Hero features**. Each service can have up to eight labels, with a 40-character limit per label. Translate labels separately in German and English. Both languages share the rows and their order.
- Keep labels specific to the service and grounded in the offer. Short labels such as “Fast to load” or “Built for phones” fit the hero and leave the details to the sections below.
- Keep keyboard focus visible. Use links for navigation and buttons for actions. Pair color with text for errors, selection, and order states.
- Animated heroes include a pause control. With reduced motion enabled, the connections stay visible and still. Keep the title and feature labels readable without motion and check both themes at desktop and phone widths.

## Implementation references

- [Shared marketing buttons](src/components/site/cms-link.tsx), [section layout and content](src/components/site/sections.tsx), and [theme switch](src/components/site/theme.tsx)
- [Home hero](src/components/site/hero.tsx), [service hero](src/components/site/service-hero.tsx), and [hero styles](src/components/site/hero.module.css)
- [Order configurator](src/components/shop/order-configurator.tsx) and [account portal styles](src/components/account/portal.module.css)
- [CMS editing guide](docs/cms.md) and [shop guide](docs/shop.md)
