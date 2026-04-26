# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview
SpecKit - Market Analyser is a Single Page Application (SPA) designed to function as an interactive Market Data Dashboard. It fetches, processes, and visually presents real-time market data, allowing users to monitor metrics, visualize historical trends, and receive insights.

## Common Development Tasks

All commands should be executed from the `frontend/` directory unless otherwise specified.

### Dependencies
- Install dependencies: `npm install`

### Development
- Start development server: `npm run dev`
- Preview production build: `npm run preview`

### Build & Quality
- Build project: `npm run build`
- Run linting: `npm run lint`
- Fix linting issues: `npm run lint:fix`

### Testing
- Run all tests: `npm run test`
- Run tests in watch mode: `npm run test:watch`
- Run tests with coverage: `npm run test:coverage`

## Project Architecture

The frontend is a modern React application built with TypeScript and Vite.

### Directory Structure (within `frontend/src/`)
- `components/`: Reusable, presentational UI components (e.g., Button, Card, DataTable).
- `hooks/`: Custom React hooks for encapsulating complex state logic and side effects (e.g., `useBarcodeData`).
- `services/`: API interaction logic, abstracting raw network calls (e.g., `barcodeApi.js`).
- `App.tsx`: The main application entry point and high-level orchestration.

### Technology Stack
- **Framework:** React.js
- **Language:** TypeScript
- **Build Tool:** Vite
- **Stylable:** Tailwind CSS
- **State Management:** Jotai
- **Testing:** Vitest & React Testing Library
- **Linting:** ESLint

<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan
<!-- SPECKIT END -->
