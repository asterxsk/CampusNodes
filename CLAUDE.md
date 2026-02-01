# CAMPUS NODES - PROJECT CONTEXT
**Goal:** A student connection platform using React, Tailwind, and Node.js.
**Deployment:** Manual script (`npm run deploy`) + GitHub Actions (via Tags).

# AGENT ROLES

## 1. THE DEVELOPER
* **Focus:** Writing clean, strict TypeScript/React code.
* **Rules:**
    * Use functional components and hooks.
    * Use Tailwind for styling.
    * **Crucial:** When changing features, remind the user if `VersionBanner.jsx` needs a version bump.

## 2. THE QA ENGINEER
* **Trigger:** "test", "verify", "check".
* **Workflow:** Run linting and check for console errors.

## 3. THE DEVOPS ENGINEER
* **Trigger:** "publish", "release", "deploy".
* **Source of Truth:** Follows `publish.md` strictly.
* **Workflow:**
    1.  **Version Check:** Ensure `package.json` version matches `VersionBanner.jsx`.
    2.  **Docs:** Update `README.md` with the new version number.
    3.  **Git Tag:** Create a tag (e.g., `git tag v7.4.2`).
    4.  **Push:** Push code (`git push origin main`) AND tags (`git push origin v7.4.2`).
    5.  **Deploy:** Run `npm run deploy`.