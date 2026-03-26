# Team Pumpkin Chat App

Full‑stack real‑time chat application with a React + TypeScript + Vite frontend and a Node.js + Express + Socket.io + MongoDB backend.

## Features
- User signup (UUID-based userId)
- List all users
- Chat contacts derived from conversation history with:
  - Last message preview
  - Unseen message count (based on lastSeen)
- Real‑time messaging via Socket.io
- Last seen tracking on disconnect and explicit updates
- Production build can be served by the backend (server serves client/dist)

## Tech Stack
- Client: React 19, TypeScript, Vite 6, React Router DOM 7, Axios, Sass, Socket.io Client
- Server: Node.js, Express, Socket.io, Mongoose, CORS, Dotenv
- Database: MongoDB (Atlas or self-hosted)

## Monorepo Structure
- client/ — React + Vite app
- server/ — Express + Socket.io API server

## Prerequisites
- Node.js 18+ and npm
- A MongoDB connection string (e.g., MongoDB Atlas)

## Environment Variables
Create a file at `server/.env` with the following variables:

```
mongodbAtlasUri=<your-mongodb-connection-string>
frontendUrl=http://localhost:5173
```

Notes:
- `frontendUrl` is informational in current code and logged on server start.
- Keep your real connection string secret and never commit it.

## Installation
Install dependencies for both workspaces:

- Server
  - cd server
  - npm install

- Client
  - cd client
  - npm install

## Running Locally
There are two common ways to run locally.

Option A: Run client and server separately (recommended during development)
- Start the API server (port 8000):
  - cd server
  - npm start
  - This starts Express + Socket.io on http://localhost:8000
- Start the client dev server (port 5173):
  - cd client
  - npm run dev
  - Vite serves the app on http://localhost:5173
- Ensure the client is configured to call the server:
  - `client/src/config/constants.ts` defaults to `http://localhost:8000`

Option B: Run production-like build via server
- Build the client:
  - cd client
  - npm run build
- Adjust API base URL in `client/src/config/constants.ts` for same-origin deployments (recommended):
  - use `window.location.origin` for production, or ensure the correct public server URL
- Start the server:
  - cd server
  - npm start
- The server will serve static files from `client/dist` and expose the API at `/api` on port 8000.

## Scripts
- Server
  - npm start — run server (Express + Socket.io)
  - npm run dev — uses nodemon (requires nodemon installed; not listed in deps)
- Client
  - npm run dev — start Vite dev server
  - npm run build — type-check and build for production
  - npm run preview — preview production build
  - npm run lint — run ESLint

## API Reference
Base URL: `http://<server-host>:8000/api`

- POST /signup
  - Body JSON: `{ "name": string, "email": string, "phone": string }`
  - Response 201: `{ name, email, phone, userId, lastSeen }`

- GET /users
  - Response 200: `Array<{ name, email, phone, userId }>`

- GET /contacts/:userId
  - Response 200: `Array<{ name, email, phone, userId, lastMessage, unseenMessageCount }>`
    - `lastMessage` shape: `{ message, timestamp, senderId, receiverId } | null`

- GET /messages?senderId=<id>&receiverId=<id>
  - Response 200: `Array<{ senderId, receiverId, message, timestamp }>`

## Real‑time Events (Socket.io)
- Client connects to the server and should:
  - Emit `join` with `userId` once connected
  - Emit `sendMessage` with `{ senderId, receiverId, message }` to send a message
  - Listen for `receiveMessage` with payload `{ senderId, receiverId, message }`
  - Emit `updateLastSeen` with `userId` to update last seen
- Server maintains an in‑memory `users` map from `userId` to `socket.id` and broadcasts `onlineUsers` on join/disconnect.

## Configuration Notes
- Client API base URL is defined in `client/src/config/constants.ts`:
  - During local dev: `http://localhost:8000`
  - For production/same-origin: `window.location.origin` is recommended
  - A commented example for a hosted server is included

## Deployment
- The server includes a `vercel.json` configuration. Note that long‑lived WebSocket connections may not be suitable for serverless functions. If using Socket.io, deploy to a persistent Node host (e.g., Railway, Render, Fly.io, a VM, or a container platform). Ensure environment variables are set in your hosting provider.
- For server‑served SPA:
  - Build the client (`cd client && npm run build`)
  - Deploy the server with `client/dist` available at `../../client/dist` relative to `server/src/index.js`

## Known Considerations
- The client includes a `signin` API helper pointing to `/api/signin`, but the server currently exposes only `POST /api/signup`. Either add a signin endpoint on the server or update the client to use the existing routes.

## License
ISC