# Publishing Guidelines

*Always use these rules while committing changes after every update*

1. **Document Changes**
   - Update `CHANGES.md` with all recent changes before publishing.
   - Include fix/feature/optimization tags for clarity.
   - Mark the new version as "Current" at the top of the changelog.

2. **Version Update & Patch Notes**
   - Increment version in `package.json` to match new release.
   - Update `CURRENT_VERSION` in `src/components/ui/VersionBanner.jsx`.
   - Add patch notes to `PATCH_NOTES` array in VersionBanner (keep 4-5 most recent features).
   - Update `README.md` to reflect the latest version number.

3. **Version Synchronization**
   - Ensure `package.json` version matches `VersionBanner.jsx`.
   - Create a git tag for the release (e.g., `git tag v7.9.0`).
   - Push code and tags: `git push origin main` and `git push origin v7.9.0`.

3. **Deployment Options**

   **Primary: Vercel (Recommended)**
   - Ensure Vercel CLI is installed: `npm i -g vercel`
   - Login to Vercel: `vercel login`
   - Deploy to production: `vercel --prod`
   - The site will be deployed at: https://campus-nodes-[hash].vercel.app and your custom domain

   **Alternative: GitHub Pages (Legacy)**
   - Run: `npm run deploy`
   - Note: This uses GitHub Pages and may be slower than Vercel

4. **GitHub Release (Automated)**
   - Pushing the tag (in step 1) automatically triggers the GitHub Action.
   - This creates a formal "Release" on GitHub with source code downloads.
   - *Optional:* You can edit the created release on GitHub to add custom patch notes/titles.

5. **Deployment Notes**
   - **Vercel** provides faster builds, preview deployments, and better analytics
   - **GitHub Pages** is simpler but slower and lacks advanced features
   - Choose Vercel for production, GitHub Pages for backup/emergency
   - Always verify deployment at the provided URL after pushing
