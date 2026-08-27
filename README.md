# No.9 Bubble Tea — website

Single-page, dependency-free static site for No.9 Bubble Tea, Wolverhampton.
Built with plain HTML, modern CSS and ES modules, so it can be hosted directly
on GitHub Pages with no build step.

## Folder structure

```
site/
├── index.html          Page markup, SEO metadata and JSON-LD
├── assets/             Logo and hero artwork
├── css/styles.css      Playful Pastels design system
├── js/
│   ├── main.js         App entry point: renders menu, gallery and order
│   ├── menu.js         Loads and validates the CMS CSV
│   ├── csv.js          Small RFC 4180 CSV parser
│   ├── cart.js         Order state and totals
│   └── whatsapp.js     Builds and opens the WhatsApp order message
├── cms/                Editable content (see cms/README.md)
├── robots.txt
├── sitemap.xml
└── .nojekyll           Tells GitHub Pages to serve files as-is
```

## Editing the menu

Everything on the menu comes from `cms/menu.csv` plus a matching PNG in
`cms/images/`. Adding a row adds a card; removing one removes it. See
`cms/README.md` for the exact format and ID rules.

## Checkout

The order button opens WhatsApp (app on mobile, WhatsApp Web on desktop) with
the order pre-filled, addressed to **+44 7766 628285**. Change the number in
`js/whatsapp.js`.

## Local preview

Serve the folder over HTTP (ES modules and `fetch` do not work from `file://`):

```sh
npx serve site
```

## Deploying to GitHub Pages

Push the contents of this folder to the repository root (or `/docs`) and enable
Pages for that branch. The `.nojekyll` file keeps the folder structure intact.
