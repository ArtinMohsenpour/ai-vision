/**
 * Starter content in German and English. Both languages are built by the same functions, so
 * arrays have the same structure in each locale. No prices, contact details, client names or
 * legal texts are invented: those must come from the company and are marked as placeholders.
 */
import { initialServiceHeroFeatures } from '../../src/migrations/data/service-hero-features'
import {
  action,
  buttons,
  cards,
  faq,
  fullWidth,
  navLink,
  page,
  service,
  serviceCards,
  text,
  twoColumns,
} from './builders'

export type Locale = 'de' | 'en'
const pick = (locale: Locale) => (de: string, en: string) => (locale === 'de' ? de : en)

export const serviceSeeds = [
  {
    slug: 'ki-telefon-und-chat-assistenten',
    sortOrder: 10,
    de: {
      title: 'KI-Telefon- und Chat-Assistenten',
      summary:
        'Ein Assistent, der Anrufe und Chat-Anfragen rund um die Uhr annimmt, häufige Fragen beantwortet und Termine oder Rückrufe aufnimmt.',
      points: ['Erreichbar auch außerhalb der Öffnungszeiten', 'Antworten auf Basis Ihrer eigenen Informationen', 'Übergabe an Ihr Team, wenn es nötig ist'],
    },
    en: {
      title: 'AI phone and chat assistants',
      summary:
        'An assistant that answers calls and chat messages around the clock, handles common questions and takes bookings or callback requests.',
      points: ['Reachable outside opening hours', 'Answers based on your own information', 'Hands over to your team when needed'],
    },
  },
  {
    slug: 'ki-automatisierung',
    sortOrder: 20,
    de: {
      title: 'KI-Automatisierung mit n8n',
      summary:
        'Wiederkehrende Abläufe wie Anfragen, Rechnungen oder Datenübertragungen automatisieren, damit Ihr Team Zeit für die eigentliche Arbeit hat.',
      points: ['Verbindet die Tools, die Sie bereits nutzen', 'Selbst gehostet möglich', 'Nachvollziehbare, dokumentierte Abläufe'],
    },
    en: {
      title: 'AI automation with n8n',
      summary:
        'Automate repeating work such as enquiries, invoices or data transfers, so your team has time for the work that matters.',
      points: ['Connects the tools you already use', 'Can be self-hosted', 'Clear, documented workflows'],
    },
  },
  {
    slug: 'websites',
    sortOrder: 30,
    de: {
      title: 'Websites',
      summary:
        'Schnelle, gut auffindbare Websites für kleine Unternehmen, die Sie selbst pflegen können – zweisprachig, wenn Sie möchten.',
      points: ['Für Smartphone, Tablet und Desktop', 'Inhalte selbst bearbeiten', 'Barrierearm und datensparsam'],
    },
    en: {
      title: 'Websites',
      summary:
        'Fast websites for small businesses that are easy to find and easy to update yourself, in two languages if you like.',
      points: ['Works on phone, tablet and desktop', 'Edit the content yourself', 'Accessible and privacy-friendly'],
    },
  },
  {
    slug: 'seo-und-ki-suche',
    sortOrder: 40,
    de: {
      title: 'SEO und KI-Suche',
      summary:
        'Damit Kundinnen und Kunden Sie finden – in Google, in Karten-Apps und in KI-Assistenten wie ChatGPT.',
      points: ['Technische Prüfung Ihrer Website', 'Inhalte, die echte Fragen beantworten', 'Lokale Sichtbarkeit'],
    },
    en: {
      title: 'SEO and AI search',
      summary: 'Help customers find you in Google, in map apps and in AI assistants such as ChatGPT.',
      points: ['Technical review of your website', 'Content that answers real questions', 'Local visibility'],
    },
  },
  {
    slug: 'software-und-apps',
    sortOrder: 50,
    de: {
      title: 'Individuelle Software und Apps',
      summary:
        'Wenn Standardsoftware nicht passt: Web-Apps, interne Tools und Schnittstellen, zugeschnitten auf Ihre Abläufe.',
      points: ['Klarer Umfang vor dem Start', 'Schrittweise Lieferung', 'Wartung nach dem Start'],
    },
    en: {
      title: 'Custom software and apps',
      summary: "When off-the-shelf software doesn't fit: web apps, internal tools and integrations built around how you work.",
      points: ['Clear scope before we start', 'Delivered in steps', 'Maintenance after launch'],
    },
  },
  {
    slug: 'web3',
    sortOrder: 60,
    de: {
      title: 'Web3 auf Anfrage',
      summary: 'Beratung und Umsetzung rund um Blockchain-Anwendungen – nur, wenn sie für Ihr Vorhaben wirklich sinnvoll sind.',
      points: ['Ehrliche Einschätzung vorab', 'Umsetzung nach Angebot'],
    },
    en: {
      title: 'Web3 on request',
      summary: 'Advice and development for blockchain applications, only when they genuinely make sense for your project.',
      points: ['An honest assessment first', 'Built to a quote'],
    },
  },
] as const

export function serviceData(seed: (typeof serviceSeeds)[number], locale: Locale) {
  const t = pick(locale)
  const copy = seed[locale]
  return {
    slug: seed.slug,
    sortOrder: seed.sortOrder,
    title: copy.title,
    heroFeatures: initialServiceHeroFeatures[seed.slug].map(([de, en]) => ({ label: t(de, en) })),
    summary: copy.summary,
    keyPoints: copy.points.map((point) => ({ text: point })),
    sections: [
      twoColumns(
        { title: t('Was Sie bekommen', 'What you get') },
        [
          text(
            t(
              `${copy.summary}\n\nWir klären zuerst, was Sie erreichen möchten, und schlagen dann eine Lösung vor, die zu Ihrem Budget und Ihren Abläufen passt.`,
              `${copy.summary}\n\nWe first clarify what you want to achieve, then propose a solution that fits your budget and the way you work.`,
            ),
          ),
        ],
        [
          cards(
            [
              [t('Gespräch', 'Conversation'), t('Wir verstehen Ihr Ziel und Ihren Alltag.', 'We learn your goal and your day-to-day work.')],
              [t('Angebot', 'Quote'), t('Fester Umfang, fester Preis.', 'A fixed scope at a fixed price.')],
              [t('Umsetzung', 'Delivery'), t('Schrittweise, mit Zwischenständen.', 'In steps, with regular previews.')],
            ],
            true,
          ),
        ],
      ),
      fullWidth({ title: t('Pakete und Preise', 'Packages and prices'), tone: 'surface' }, [
        text(
          t(
            'Pakete mit Festpreis und optionalen Erweiterungen finden Sie bald hier. Für individuelle Vorhaben erstellen wir ein Angebot.',
            'Fixed-price packages with optional add-ons will be listed here soon. For custom projects we prepare a quote.',
          ),
        ),
        buttons([[t('Projekt anfragen', 'Start a project'), page('contact')]]),
      ]),
    ],
  }
}

const contactCta = (locale: Locale) => {
  const t = pick(locale)
  return fullWidth(
    {
      title: t('Lassen Sie uns über Ihr Vorhaben sprechen', "Let's talk about your project"),
      subtitle: t(
        'Beschreiben Sie kurz, was Sie vorhaben. Wir melden uns mit einer ehrlichen Einschätzung.',
        "Tell us briefly what you have in mind. We'll get back to you with an honest assessment.",
      ),
      tone: 'accent',
    },
    [buttons([[t('Kontakt aufnehmen', 'Get in touch'), page('contact')]])],
  )
}

const legalPlaceholder = (locale: Locale, title: string) => {
  const t = pick(locale)
  return {
    title,
    sections: [
      fullWidth({}, [
        text(
          t(
            '**Platzhalter:** Dieser Text muss vor dem Start durch den geprüften Rechtstext ersetzt werden.',
            '**Placeholder:** Replace this text with the reviewed legal text before launch.',
          ),
        ),
      ]),
    ],
    seo: { noIndex: true },
  }
}

export function pageData(locale: Locale): Record<string, Record<string, unknown>> {
  const t = pick(locale)
  return {
    home: {
      eyebrow: t('Software- und KI-Studio aus Köln', 'Software and AI studio in Cologne'),
      title: t('Software, Websites und KI für Ihr Unternehmen', 'Software, websites and AI for your business'),
      subtitle: t(
        'Wir helfen Selbstständigen, Läden, Restaurants und kleinen Unternehmen, Zeit zu sparen und online gefunden zu werden – mit klaren Paketen und festen Preisen.',
        'We help freelancers, shops, restaurants and small companies save time and get found online, with clear packages and fixed prices.',
      ),
      actions: [
        action(t('Leistungen ansehen', 'View services'), page('services-overview')),
        action(t('Kontakt', 'Contact'), page('contact'), 'secondary'),
      ],
      sections: [
        fullWidth({ title: t('Warum mit uns arbeiten', 'Why work with us'), tone: 'surface' }, [
          cards([
            [t('Feste Preise', 'Fixed prices'), t('Sie wissen vorher, was es kostet.', 'You know the cost before we start.')],
            [t('Für kleine Unternehmen', 'Built for small businesses'), t('Lösungen in einer Größe, die zu Ihnen passt.', 'Solutions sized to fit your business.')],
            [t('Daten in Deutschland', 'Data in Germany'), t('Hosting in Deutschland, datensparsam umgesetzt.', 'Hosted in Germany, built with privacy in mind.')],
          ]),
        ]),
        contactCta(locale),
      ],
    },
    'services-overview': {
      eyebrow: t('Leistungen', 'Services'),
      title: t('Unsere Leistungen', 'Our services'),
      subtitle: t(
        'Von der Website bis zum KI-Assistenten: Wählen Sie ein Paket oder fragen Sie ein individuelles Angebot an.',
        'From websites to AI assistants: choose a package or ask for a custom quote.',
      ),
      sections: [fullWidth({}, [serviceCards()]), contactCta(locale)],
    },
    pricing: {
      eyebrow: t('Pakete & Preise', 'Packages & pricing'),
      title: t('Klare Pakete, feste Preise', 'Clear packages, fixed prices'),
      subtitle: t(
        'Jedes Paket hat einen Grundpreis. Erweiterungen wählen Sie dazu. Für alles andere gibt es ein Angebot.',
        'Every package has a base price. Add the extras you need. For anything else, we send a quote.',
      ),
      sections: [
        fullWidth({ title: t('So setzen sich die Preise zusammen', 'How pricing works') }, [
          cards(
            [
              [t('Paket wählen', 'Choose a package'), t('Grundpreis „ab“, abhängig vom Umfang.', 'A "from" base price, depending on scope.')],
              [t('Erweiterungen hinzufügen', 'Add extras'), t('Optionale Add-ons, einmalig oder monatlich.', 'Optional add-ons, one-off or monthly.')],
              [t('Oder Angebot anfragen', 'Or request a quote'), t('Für individuelle Projekte erstellen wir ein Angebot.', 'For custom projects we prepare a quote.')],
            ],
            true,
          ),
        ]),
        fullWidth({ title: t('Fragen zu Preisen', 'Questions about pricing') }, [
          faq([
            [
              t('Gelten die Preise netto?', 'Are prices net?'),
              t(
                'Wir arbeiten ausschließlich für Unternehmen. Ob und wie Umsatzsteuer ausgewiesen wird, steht bei jedem Paket.',
                'We work for businesses only. Each package states whether and how VAT is shown.',
              ),
            ],
            [
              t('Kann ich später erweitern?', 'Can I add more later?'),
              t('Ja. Erweiterungen können Sie jederzeit dazubuchen.', 'Yes. You can add extras at any time.'),
            ],
          ]),
        ]),
        contactCta(locale),
      ],
    },
    about: {
      eyebrow: t('Über uns', 'About us'),
      title: t('Ein kleines Studio für Software und KI', 'A small studio for software and AI'),
      subtitle: t(
        'Wir sind in Köln zu Hause und arbeiten für Selbstständige und kleine Unternehmen.',
        'We are based in Cologne and work with freelancers and small businesses.',
      ),
      sections: [
        twoColumns(
          { title: t('Wofür wir stehen', 'What we stand for') },
          [
            text(
              t(
                'Gute Software muss nicht kompliziert oder teuer sein. Wir bauen Lösungen, die genau so groß sind, wie Ihr Unternehmen sie braucht – und erklären verständlich, was wir tun.',
                "Good software doesn't have to be complicated or expensive. We build solutions that are exactly as big as your business needs, and we explain what we do in plain words.",
              ),
            ),
          ],
          [
            cards([
              [t('Ehrlich', 'Honest'), t('Wir sagen auch, wenn sich etwas nicht lohnt.', "We tell you when something isn't worth it.")],
              [t('Verständlich', 'Clear'), t('Keine Fachbegriffe ohne Erklärung.', 'No jargon without an explanation.')],
              [t('Verlässlich', 'Reliable'), t('Feste Preise und klare Absprachen.', 'Fixed prices and clear agreements.')],
            ]),
          ],
        ),
        contactCta(locale),
      ],
    },
    'how-it-works': {
      eyebrow: t('Ablauf', 'Process'),
      title: t('So arbeiten wir', 'How we work'),
      subtitle: t('Vom ersten Gespräch bis nach dem Start – in klaren Schritten.', 'From the first conversation to after launch, in clear steps.'),
      sections: [
        fullWidth({}, [
          cards(
            [
              [t('Anfrage', 'Enquiry'), t('Sie beschreiben kurz Ihr Vorhaben.', 'You briefly describe your project.')],
              [t('Gespräch', 'Conversation'), t('Wir klären Ziele, Umfang und Zeitplan.', 'We clarify goals, scope and timeline.')],
              [t('Paket oder Angebot', 'Package or quote'), t('Sie bestellen ein Paket oder erhalten ein Angebot.', 'You order a package or receive a quote.')],
              [t('Umsetzung', 'Delivery'), t('Wir setzen um und zeigen Zwischenstände.', 'We build it and share regular previews.')],
              [t('Start', 'Launch'), t('Gemeinsamer Test, dann geht es live.', 'We test together, then go live.')],
              [t('Betreuung', 'Support'), t('Auf Wunsch kümmern wir uns um Wartung und Updates.', 'If you like, we take care of maintenance and updates.')],
            ],
            true,
          ),
        ]),
        contactCta(locale),
      ],
    },
    faq: {
      eyebrow: 'FAQ',
      title: t('Häufige Fragen', 'Frequently asked questions'),
      sections: [
        fullWidth({}, [
          faq([
            [
              t('Für wen arbeiten Sie?', 'Who do you work for?'),
              t(
                'Ausschließlich für Unternehmen: Selbstständige, kleine Firmen, Läden und Restaurants.',
                'For businesses only: freelancers, small companies, shops and restaurants.',
              ),
            ],
            [
              t('Wie lange dauert ein Projekt?', 'How long does a project take?'),
              t('Das hängt vom Umfang ab. Die Lieferzeit steht bei jedem Paket.', 'It depends on the scope. Each package states its delivery time.'),
            ],
            [
              t('Kann ich Inhalte selbst ändern?', 'Can I change the content myself?'),
              t('Ja. Websites erhalten ein einfaches Redaktionssystem.', 'Yes. Websites come with a simple content editor.'),
            ],
            [
              t('Wie bezahle ich?', 'How do I pay?'),
              t('Online bei der Bestellung oder nach Annahme eines Angebots.', 'Online when you order, or after accepting a quote.'),
            ],
          ]),
        ]),
        contactCta(locale),
      ],
    },
    contact: {
      eyebrow: t('Kontakt', 'Contact'),
      title: t('Sprechen wir über Ihr Projekt', "Let's talk about your project"),
      subtitle: t(
        'Erzählen Sie uns, was Sie vorhaben – wir melden uns bei Ihnen.',
        "Tell us what you have in mind and we'll get back to you.",
      ),
      sections: [
        twoColumns(
          { title: t('So geht es weiter', 'What happens next') },
          [
            cards(
              [
                [t('Sie schreiben uns', 'You write to us'), t('Ein paar Sätze zu Ihrem Vorhaben genügen.', 'A few sentences about your project are enough.')],
                [t('Wir melden uns', 'We get back to you'), t('Mit Rückfragen oder einem Terminvorschlag.', 'With questions or a suggested call.')],
                [t('Sie erhalten ein Angebot', 'You receive a quote'), t('Mit festem Umfang und Preis.', 'With a fixed scope and price.')],
              ],
              true,
            ),
          ],
          [
            text(
              t(
                '**Platzhalter:** Kontaktdaten und Anfrageformular werden hier ergänzt.',
                '**Placeholder:** Contact details and the enquiry form will be added here.',
              ),
            ),
          ],
        ),
      ],
    },
    impressum: legalPlaceholder(locale, t('Impressum', 'Legal notice')),
    privacy: legalPlaceholder(locale, t('Datenschutzerklärung', 'Privacy policy')),
    terms: legalPlaceholder(locale, t('Allgemeine Geschäftsbedingungen', 'Terms and conditions')),
  }
}

export function navbarData(locale: Locale, services: { id: number; title: string; summary: string }[]) {
  const t = pick(locale)
  return {
    items: [
      {
        label: t('Leistungen', 'Services'),
        type: 'dropdown',
        children: [
          { ...navLink(t('Alle Leistungen', 'All services'), page('services-overview')), description: t('Überblick', 'Overview') },
          ...services.map((entry) => ({ ...navLink(entry.title, service(entry.id)), description: null })),
        ],
      },
      { label: t('Preise', 'Pricing'), type: 'link', appearance: 'link', link: { ...page('pricing'), newTab: false } },
      { label: t('So arbeiten wir', 'How we work'), type: 'link', appearance: 'link', link: { ...page('how-it-works'), newTab: false } },
      { label: t('Über uns', 'About'), type: 'link', appearance: 'link', link: { ...page('about'), newTab: false } },
      { label: 'FAQ', type: 'link', appearance: 'link', link: { ...page('faq'), newTab: false } },
      { label: t('Kontakt', 'Contact'), type: 'link', appearance: 'button', link: { ...page('contact'), newTab: false } },
    ],
  }
}

export function footerData(locale: Locale, services: { id: number; title: string }[]) {
  const t = pick(locale)
  return {
    tagline: t(
      'Software, Websites und KI für kleine Unternehmen. Aus Köln.',
      'Software, websites and AI for small businesses. From Cologne.',
    ),
    columns: [
      { title: t('Leistungen', 'Services'), links: services.map((entry) => navLink(entry.title, service(entry.id))) },
      {
        title: t('Unternehmen', 'Company'),
        links: [
          navLink(t('Über uns', 'About us'), page('about')),
          navLink(t('So arbeiten wir', 'How we work'), page('how-it-works')),
          navLink(t('Pakete & Preise', 'Packages & pricing'), page('pricing')),
          navLink('FAQ', page('faq')),
          navLink(t('Kontakt', 'Contact'), page('contact')),
        ],
      },
    ],
    legalLinks: [
      navLink(t('Impressum', 'Legal notice'), page('impressum')),
      navLink(t('Datenschutz', 'Privacy'), page('privacy')),
      navLink(t('AGB', 'Terms'), page('terms')),
    ],
  }
}
