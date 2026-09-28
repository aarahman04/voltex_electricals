# Voltex Electricals

Vite/React product catalogue deployed to Vercel from the `main` branch.

## Local development

```sh
npm install
npm run dev
```

`/curate` works locally through the Vite development server. Product and image removals are saved in `Products/curation.json`; the catalogue is regenerated immediately. Run `npm run build` and `npm run lint` before publishing.

## Live curation setup

In the Vercel project, set these **Production** environment variables:

| Name | Value |
| --- | --- |
| `CURATE_USERNAME` | The curator username |
| `CURATE_PASSWORD` | The curator password |
| `CURATION_GITHUB_TOKEN` | A GitHub fine-grained personal access token with **Contents: Read and write** permission for `aarahman04/voltex_electricals` |

Keep the values in Vercel settings, not in Git. Redeploy the `main` branch after setting or changing environment variables.

At `https://www.voltexelectricals.co.in/curate`, sign in, select products, and press **Remove selected**. The API commits the updated removal list to `main`. The storefront reads that list on every new page load, so selected products disappear immediately without waiting for the GitHub-triggered rebuild. The rebuild updates the static catalogue. The **Removed** tab can restore a product; restored products appear after that rebuild. Image choices also take effect after the rebuild.

The curation API is at `/api/curation`. It runs as a Vercel Function. Only authenticated requests can change the removal list. The public storefront reads only removed product IDs. Remove the `/curate` route and the API when curation is finished.
