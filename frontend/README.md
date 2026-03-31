# EstateX Frontend

This is the frontend application for the EstateX real estate platform, built with React, Vite, and Tailwind CSS.

## Features

- **Modern Architecture**: Built on Vite with React 18 for high performance.
- **Scalable Structure**: Well-organized directory structure separating components, pages, services, layouts, and contexts.
- **Beautiful UI**: Highly responsive and stunning user interface styled with Tailwind CSS and Framer Motion.
- **Authentication Ready**: Includes React Context for managing JWT and mocked authentication hooks.
- **Reusable Components**: Includes glass-morphism cards, buttons, inputs, loaders, and property galleries.

## Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Copy the example environment file and configure it if necessary:
   ```bash
   cp .env.example .env
   ```

3. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.

## Building for Production

To create a production build:
```bash
npm run build
```

The optimized built files will be located in the `dist` directory.

## Current State

* The application currently uses mocked data and mock authentication since the backend property routes have not been implemented yet.
* Tailwind CSS has been fully configured alongside a custom color palette defined in `src/index.css`.
