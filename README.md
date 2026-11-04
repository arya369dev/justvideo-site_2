# JustVideo Broadcast website

Cinematic one-page site for Just Video Broadcast Pvt. Ltd.: camera rental, post-production and sound, Andheri West, Mumbai.

Plain HTML, CSS and JavaScript with no build step, plus one Vercel serverless function for the enquiry form.

## What's in the folder

```
index.html            Home page (hero film, rental, post & sound, credits, about, contact)
privacy.html          Privacy notice (template, see checklist)
thank-you.html        Shown after a no-JavaScript form submit
enquiry-error.html    Shown if a no-JavaScript submit fails
404.html              Custom "page not found"
css/styles.css        All styles (colours and fonts are at the top, under :root)
js/main.js            Menu, hero video, film pop-up, credits tabs, form
api/enquiry.js        Sends form enquiries to your inbox via Resend
assets/video/         hero-loop.mp4 (silent background loop), justvideo-intro.mp4 (full film with sound)
assets/img/           Logo, icons, hero poster frame, studio photos, film/TV posters
assets/fonts/         Anton, Instrument Serif, Inter (free stand-ins, open font licence)
vercel.json           Clean URLs, security headers, caching
robots.txt, sitemap.xml, site.webmanifest, favicon.ico
```

## 1. Put it on GitHub

1. Go to https://github.com/new and create a repository, e.g. `justvideo-website` (Private is fine).
2. On the new repo page click **uploading an existing file**, then drag in **everything inside this folder** (not the folder itself) and click **Commit changes**.
   Or, with Git installed:
   ```bash
   cd justvideo-website
   git init && git add . && git commit -m "JustVideo website"
   git branch -M main
   git remote add origin https://github.com/<your-username>/justvideo-website.git
   git push -u origin main
   ```

## 2. Deploy on Vercel

1. Go to https://vercel.com/new, sign in with GitHub and **Import** the repository.
2. Framework preset: **Other**. Leave Build Command and Output Directory empty. Click **Deploy**.
3. The site goes live on a `*.vercel.app` address. Every push to GitHub redeploys it automatically.

## 3. Turn on the enquiry form

The form needs a free Resend account (https://resend.com). Until this is done, visitors see a message with your phone and email instead.

1. Create an API key in Resend.
2. In Vercel: **Project → Settings → Environment Variables**, add:
   | Name | Value |
   |---|---|
   | `RESEND_API_KEY` | your Resend key |
   | `ENQUIRY_TO` | `justvideobroadcasting@gmail.com` (comma-separate for more than one) |
   | `ENQUIRY_FROM` | *(after verifying your domain in Resend)* `JustVideo Website <enquiries@yourdomain>` |
   | `ALLOWED_ORIGIN` | *(optional, after the domain is live)* `https://www.yourdomain` |
3. **Redeploy** (Deployments → ⋯ → Redeploy), then send a test enquiry.

Without `ENQUIRY_FROM`, Resend's test sender only delivers to the email address you signed up to Resend with, so sign up with `justvideobroadcasting@gmail.com` or verify your own domain.

## 4. Connect your domain

Vercel → Project → **Settings → Domains** → add your domain and follow the DNS steps. Then replace `YOUR-DOMAIN` in `robots.txt` and `sitemap.xml`.

## Before launch: please confirm

- [ ] **Equipment lists** in `index.html` (section `id="rental"`). These are taken from recent client requirement messages. Remove anything you don't own or rent out.
- [ ] **Facility numbers** (7 edit rooms, 2 DI suites, 2 mixing studios, 2 dubbing studios) come from the 2014 brochure.
- [ ] **Credits.** The film list matches crew credits in the Origin Picture Studioz brochure. Some films (e.g. Munna Bhai M.B.B.S., Dhoom, Black) were released before the studio opened in 2010. The section currently reads "our studio and team"; adjust if you prefer to show only company projects.
- [ ] **Client names.** Confirm you're happy to list them (text only, no logos).
- [ ] **WhatsApp number.** All WhatsApp buttons use 98670 28666. To change it, search for `919867028666` in `index.html`.
- [ ] **Privacy notice.** Review against the DPDP Act 2023.
- [ ] **Hero film.** It appears to be AI-generated: it shows a "RED"-branded camera and a small sparkle watermark in the bottom-right corner. Swap in real footage when you have it.

## Fonts: The Mezirane and Edition

The design is set up for two display fonts:
- **The Mezirane** (Almarkha Type) for headings. It's a paid font (MyFonts, from about $23). The free download is for personal use only, so buy a licence that covers web use.
- **Edition** for the red accent words and numbers.

Until the font files are added, the site uses free look-alikes: **Anton** for The Mezirane and **Instrument Serif** for Edition.

To switch to the real fonts:
1. Convert the licensed `.otf`/`.ttf` files to `.woff2` (for example at https://cloudconvert.com/ttf-to-woff2), if your licence allows web use.
2. Save them as `assets/fonts/the-mezirane.woff2` and `assets/fonts/edition.woff2`.
3. In `css/styles.css`, remove the comment marks around the two `@font-face` lines under **LICENSED FONTS**.

## Editing later

- **Replace the hero loop:** overwrite `assets/video/hero-loop.mp4` (silent, H.264, about 6–15 s, under 4 MB) and `assets/img/hero-poster.jpg` (a still from it).
- **Add a poster:** save a 480×720 `.webp` or `.jpg` in `assets/img/posters/`, then copy one `<li>…</li>` block in the credits list and change the image path and title. The first 10 films show before "Show all".
- **Colours:** change `--navy` and `--red` at the top of `css/styles.css`.
- Assets are cached for 7 days. If you replace a file and keep its name, add `?v=2` to the link in `index.html` so visitors get the new version.
