# Spotify Wrapped

A personal Spotify Wrapped clone that connects to your Spotify account and shows
you your top artists, tracks, and genres. Built as a learning project with Vue 3
on the frontend and Hono on the backend.

## What it does

You log in with your Spotify account, and the app pulls your listening data
through the Spotify Web API. It shows your most-played artists and tracks in a
podium-style layout (think: gold, silver, bronze) with the option to switch
between different time ranges -- last 4 weeks, last 6 months, or all time.
Results are cached in Redis so you don't hit the API on every page load.

## Tech stack

- **Frontend:** Vue 3, TypeScript, Vite, vue-router
- **Backend:** Hono (Node.js), TypeScript
- **Cache:** Redis
- **Deployment:** Docker Compose, Nginx

## Prerequisites

- Node.js 22 (or 20.19+)
- A Spotify Developer account with a registered app (see below)
- Redis running locally (for local development)
- Docker and Docker Compose (if you want to run it containerized)

## Setting up Spotify

1. Go to https://developer.spotify.com/dashboard and create a new app.
2. In your app settings, add `http://127.0.0.1:5173/dashboard` as a Redirect URI.
3. Keep the Client ID and Client Secret handy -- you'll need them in the next step.

## Environment variables

Copy the `.env.example` file, rename it to `.env`, and fill in the Client ID and
Client Secret from your Spotify Developer app.
Then copy the same file into the backend folder so the server can read it too:
cp .env backend/my-app/.env

## Getting started (local)

You need three things running: Redis, the backend, and the frontend.
**1. Start Redis**
Make sure Redis is running on `localhost:6379`. If you have Docker but want to
run only Redis in a container:
docker run -d -p 6379:6379 redis
**2. Start the backend**
cd backend/my-app
npm install
npm run dev
The backend starts on http://localhost:3000.
**3. Start the frontend**
Open a second terminal:
cd frontend
npm install
npm run dev
The frontend starts on http://127.0.0.1:5173. Open it in your browser and log
in with Spotify.

## Getting started (Docker)

Make sure your `.env` file is set up (see above), then:
docker compose up --build
The app will be available on http://localhost:80. Note that the current Docker
Compose setup does not include a Redis service, so you'll need to either add one
or point the backend to an external Redis instance.

## Project structure

    spotifywrapped/
      frontend/            Vue 3 app (Vite, TypeScript)
        src/
          pages/           Page components (Login, Dashboard, TopArtists, TopTracks)
          components/      Reusable UI components (NavBar, TopArtists, TopTracks)
          services/        Spotify API calls
          router/          Vue Router config
      backend/
        my-app/            Hono API server (TypeScript)
          src/
            lib/           Redis client and caching helpers
            utils/         Spotify token exchange, random string generation
            tests/         Backend tests
      docker-compose.yml
      .env.example

## Running tests

    cd frontend && npx vitest run
    cd backend/my-app && npx vitest run

---
