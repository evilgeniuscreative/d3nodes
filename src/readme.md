# GithubForce Directed Graph Notes


1. Search UI
Input for GitHub usernames (autocomplete with debounce)

Show loading states and results

On select: fetch that user’s details and their followers/following

2. D3 Force-Directed Graph
Central node = selected user

Linked nodes = followers and people they follow

Interactive: zoom, pan, click to expand new nodes or show info

3. User Detail Panel
Clicking a node opens a modal or side drawer

Displays: avatar, username, bio, location, link

4. State Management
You can pick Context, useReducer, or Redux

Manage selected user, graph state, UI states

5. Server/API Layer
Use Node.js backend to proxy GitHub API calls

Handle caching to avoid re-fetching

6. Styling
Use Tailwind CSS for styling

7. Flow: User searches “torvalds” → Fetch profile + followers/following → Render graph → Click node to expand → Show user info.