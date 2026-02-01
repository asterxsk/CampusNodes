# Publishing Guidelines

*Always use these rules while committing changes after every update*

1. **Push changes as packages with site version number (should be matching)**
   - Update `package.json` version to match the site version (e.g., in `VersionBanner.jsx`).
   - Create a git tag for the release (e.g., `git tag v7.4.2`).
   - Push code and tags: `git push origin main` and `git push origin v7.4.2`.

2. **Deploy to live site**
   - Run the deploy script: `npm run deploy`

3. **GitHub Release (Automated)**
   - Pushing the tag (in step 1) automatically triggers the GitHub Action.
   - This creates a formal "Release" on GitHub with source code downloads.
   - *Optional:* You can edit the created release on GitHub to add custom patch notes/titles if the auto-generated ones are insufficient.
