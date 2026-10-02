# Voltex Electricals

Vite/React product catalogue deployed to Vercel from the `main` branch.

## Local development

```sh
npm install
npm run dev
```

`/admin` works locally through the Vite development server (`/__admin`, no login). Everything it changes is written to files: `Products/curation.json` (removals, photo clean-up, prices on scraped products), `Products/admin/products.json` and `taxonomy.json` (products added by hand) and `public/products/admin/` (their photos); the catalogue is regenerated immediately. Run `npm run build` and `npm run lint` before publishing. The API contract is in `docs/admin-api.md`.

## Live admin setup

In the Vercel project, set these **Production** environment variables:

| Name | Value |
| --- | --- |
| `ADMIN_USERNAME` (or `CURATE_USERNAME`) | The admin username |
| `ADMIN_PASSWORD` (or `CURATE_PASSWORD`) | The admin password |
| `CURATION_GITHUB_TOKEN` | A GitHub fine-grained personal access token with **Contents: Read and write** permission for `aarahman04/voltex_electricals` |

`ADMIN_*` wins when both are set; the older `CURATE_*` names keep working. Keep the values in Vercel settings, not in Git. Redeploy the `main` branch after setting or changing environment variables.

At `https://www.voltexelectricals.co.in/admin`, sign in. Every change is one commit to `main` made through the GitHub API, and the Vercel rebuild that follows publishes it (about 1–2 minutes). Removed products disappear immediately: the storefront reads the removal list on every new page load. Added products, prices, restores and photo clean-up appear after the rebuild.

The API is at `/api/admin`. It runs as a Vercel Function. Only authenticated requests can change anything. The public storefront reads only removed product IDs.
