# Turborepo starter with pnpm

This is an official starter turborepo with express backend and vite react frontend, both using trpc and websocket for subcriptions

## What's inside?

This turborepo uses [pnpm](https://pnpm.io) as a packages manager. It includes the following packages/apps:

### Apps and Packages

- `api`: an express server
- `client`: an vite react app 

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

- `pnpm dev` to run both api and client (vite has already proxy setup so you dont need to worry about cors)
- `docker-compose up --build` to build application, checkout docker-compose.yml to see port
