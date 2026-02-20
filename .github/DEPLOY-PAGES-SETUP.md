# Fix “/src/main.jsx” / MIME type error on GitHub Pages

If you see **Loading module from ".../src/main.jsx" was blocked because of a disallowed MIME type ("text/html")**, the site is serving the **source** repo, not the **built** app.

## 1. Use GitHub Actions as the Pages source

1. Open your **TextOps** repo on GitHub.
2. Go to **Settings → Pages** (left sidebar).
3. Under **Build and deployment**:
   - **Source** must be **“GitHub Actions”**.
   - If it is **“Deploy from a branch”**, change it to **“GitHub Actions”** and save.

Until this is set, GitHub serves the branch (e.g. `main`) as static files, so you get the dev `index.html` with `/src/main.jsx` instead of the built one.

## 2. Ensure the workflow is on the default branch

- The file **`.github/workflows/deploy-pages.yml`** must exist on the branch that you push to (usually **main**).
- If you added it on another branch, merge that branch into **main** and push.

## 3. Run a deployment

- **Option A:** Push a commit to **main** (the workflow runs on push to `main`).
- **Option B:** Go to **Actions → “Deploy to GitHub Pages”** → **Run workflow** (branch: main) → **Run workflow**.

Wait until the run is green.

## 4. Confirm the build output

In that workflow run, open the **“Verify build uses correct base path”** step. You should see lines like:

- `src="/TextOps/assets/index-xxxxx.js"` (or similar)
- **No** `/src/main.jsx`.

If you see `/src/main.jsx` there, the build didn’t use the right base; if you see `/TextOps/assets/...`, the artifact is correct.

## 5. Open the correct URL (no cache)

- Use: **`https://<your-username>.github.io/TextOps/`**  
  (replace `<your-username>` with your GitHub username; **trailing slash** and **TextOps** in the path.)
- Do a **hard refresh** (Ctrl+Shift+R or Cmd+Shift+R) or open in a **private/incognito** window.

After this, the site should load from the built files and the `/src/main.jsx` / MIME type error should stop. If the error still shows **aspandyar.me**, you’re still loading the old page; use the **github.io/TextOps/** URL above to test the Pages deployment.
