# /publish
Description: Automates the specific Campus Nodes release process.

1. **Version Sync Check:**
   - Read `src/components/VersionBanner.jsx` (or similar) to find the site version.
   - Read `package.json` and ensure the version matches. If not, abort and tell me to fix it.

2. **Git Tagging:**
   - Ask me to confirm the tag name (e.g., "v7.4.2").
   - Run `git tag <tag_name>`.

3. **Pushing:**
   - Run `git push origin main`.
   - Run `git push origin <tag_name>`.

4. **Deployment:**
   - Run `npm run deploy`.

5. **Final Notice:**
   - Remind me that the GitHub Action has been triggered by the tag push.