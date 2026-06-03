# KaviTek, LLC — Marketing Website

A professional, single-page marketing website for **KaviTek, LLC**, a custom software development company based in Spotsylvania, Virginia.

---

## Overview

This is a fully self-contained single HTML file with embedded CSS and JavaScript. No build step, no package manager, no backend required.

**Live stack:**
- HTML5 / CSS3 / Vanilla JavaScript
- [Tailwind CSS](https://tailwindcss.com/) via CDN (utility classes)
- [Inter](https://fonts.google.com/specimen/Inter) via Google Fonts
- No other external dependencies

---

## File Structure

```
DevTest/
├── index.html   # Entire site — markup, styles, and scripts
└── README.md    # This file
```

---

## Sections

| # | Section | ID |
|---|---------|-----|
| 1 | Sticky Navigation Bar | _(global)_ |
| 2 | Hero | `#hero` |
| 3 | Trust Bar | _(below hero)_ |
| 4 | Services — What We Build | `#services` |
| 5 | Why KaviTek | `#why-kavitek` |
| 6 | Pricing | `#pricing` |
| 7 | How It Works | `#how-it-works` |
| 8 | Who We Serve | `#about` |
| 9 | Contact / Quote Form | `#contact` |
| 10 | Footer | _(global)_ |

---

## Features

- **Sticky nav** — transparent over the hero, transitions to solid navy on scroll
- **Hamburger menu** — collapses nav links on mobile with accessible `aria-expanded` toggle
- **Animated hero background** — canvas-based particle network (no library)
- **Scroll animations** — `IntersectionObserver` fade-in-up on all sections and cards
- **Hover effects** — lift + shadow on all cards and buttons
- **Pricing cards** — "Most Popular" badge on Business tier; all three link to the contact form
- **7-step process stepper** — horizontal on desktop, vertical list on mobile
- **Contact form** — client-side validation (name, email format, message); shows a success message on submit; no backend required
- **Fully responsive** — mobile, tablet, and desktop breakpoints via Tailwind
- **Accessibility** — semantic HTML5 elements, `aria-label` / `aria-expanded` / `role` attributes, visible `:focus-visible` outlines, sufficient color contrast

---

## Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--navy` | `#0d1b2a` | Primary background, headings |
| `--navy-dark` | `#08111a` | Footer background |
| `--navy-light` | `#152438` | Secondary dark surfaces |
| `--accent` | `#2b5797` | Buttons, badges, icons |
| `--accent-light` | `#3a6db5` | Hover states |
| `--gray-light` | `#f5f7fa` | Alternating section backgrounds |

---

## Typography

**Inter** (Google Fonts) — weights 300, 400, 500, 600, 700, 800, 900.

Fallback stack: `system-ui, sans-serif`

---

## Running Locally

No server required — open the file directly in any modern browser:

```
index.html   →   Open with browser
```

Or serve with any static file server, e.g.:

```bash
# Python
python -m http.server 8080

# Node (npx)
npx serve .
```

Then navigate to `http://localhost:8080`.

---

## Customization

All content is inline in `index.html`. Key areas to update:

- **Business details** — search for `Spotsylvania` to find location references
- **Pricing figures** — update inside the `#pricing` section cards
- **Color palette** — CSS custom properties are declared in the `:root` block near the top of the `<style>` tag
- **Contact form action** — the form is UI-only; wire up the `submit` handler in the `<script>` block to your preferred backend (e.g., Formspree, EmailJS, Azure Function)

---

## Browser Support

Targets all modern evergreen browsers (Chrome, Edge, Firefox, Safari). Uses `IntersectionObserver`, `canvas`, and CSS custom properties — all broadly supported since 2018+.

---

## License

© 2025 KaviTek, LLC · Spotsylvania, Virginia · All Rights Reserved.
