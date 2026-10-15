# Contributing to MetroMitra

## Branch and pull request flow

1. Start from the latest main branch.
2. Create a focused feature branch, for example feature/offline-station-planner.
3. Keep commits scoped to the feature and write clear commit messages.
4. Review the complete diff before opening a pull request.
5. Open a pull request into main; do not push feature work directly to main.
6. The maintainer reviews and merges the pull request.

## Review checklist

- Confirm route sequences against Pune Metro's published route map.
- Do not present estimates, fares, arrivals, platform numbers, crowd counts, or alerts as live unless an authoritative feed supplies them.
- Check keyboard navigation, screen-reader labels, mobile layout, and English/Hindi/Marathi UI behavior.
- Keep API secrets on the server and out of commits.
- Describe what was manually checked and list any provider or data limitations in the pull request.
