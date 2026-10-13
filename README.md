# Jason Cypret Blog

Personal blog and portfolio site built with Eleventy.

## Setup

This project uses [asdf](https://asdf-vm.com/) for Node version management and [yarn](https://yarnpkg.com/) for dependencies.

1. Install the Node version from [`.nvmrc`](.nvmrc):
   ```bash
   asdf install
   ```
2. Install packages:
   ```bash
   yarn install
   ```

## Run locally

```bash
yarn dev
```

The site is served at `http://localhost:8080` (Eleventy’s default).

## Build

```bash
yarn build
```

Output is written to `_site/`. Netlify runs the same command in production (see [`netlify.toml`](netlify.toml)).

## Deploy

The site is hosted on **Netlify** and deploys when you **push to `master`** on GitHub (continuous deployment). Build settings are defined in [`netlify.toml`](netlify.toml):

- **Build command:** `yarn build`
- **Publish directory:** `_site`
- **Node / Yarn:** versions pinned under `[build.environment]`

If you clone this repo into a new Netlify site: **Import from Git** → pick the repo → set **Production branch** to `master`. Netlify will read `netlify.toml` automatically.

## Custom domain and DNS

Do this in the Netlify UI for your site: **Site configuration** → **Domain management** → **Add a domain** → enter `jasoncypret.com` (and `www` if you use it). Netlify will tell you exactly what to configure next.

**Option A — Netlify DNS (simplest)**  
In **Domain management**, choose to use Netlify DNS. Netlify gives you **nameservers** (e.g. `dns1.p##.nsone.net`). At your **domain registrar** (where you bought the domain), replace the existing nameservers with Netlify’s. Propagation can take a few hours. SSL (HTTPS) is issued automatically once DNS is correct.

**Option B — Keep your current DNS provider**  
Stay on your registrar’s DNS or a third-party DNS host. In Netlify’s domain panel, open **DNS configuration** (or the verification steps for the domain you added). **Add the records Netlify lists**—usually:

- **`www`** → **CNAME** pointing to your site’s Netlify hostname (e.g. `something.netlify.app`).
- **Apex** (`@` or bare domain) → **A** records to Netlify’s load balancer IPs **as shown in your Netlify dashboard** (do not copy old IPs from a blog post; use what Netlify shows today).

After DNS propagates, Netlify provisions a Let’s Encrypt certificate. If something fails, use **Domain management** → **Verify DNS configuration** and fix any records Netlify flags.

For more detail, see Netlify’s guide: [Configure external DNS for a custom domain](https://docs.netlify.com/domains-essentials/custom-domains/configure-external-dns/).
