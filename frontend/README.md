# SpecKit - Market Analyser Frontend

## 🌟 Overview

The `frontend/` directory contains the complete client-side application for the SpecKit Market Analyser. This Single Page Application (SPA) is responsible for fetching, processing, and visually presenting complex, real-time market data to users. Its primary purpose is to function as an interactive **Market Data Dashboard**, allowing users to monitor market metrics, visualize historical trends, and receive critical insights derived from our backend systems.

## 🚀 Quick Start Guide

To get the application running on your local machine, follow these steps:

1.  **Install Dependencies:**
    Navigate to the project root and run:
    ```bash
    npm install
    ```
2.  **Start the Development Server:**
    ```bash
    npm run dev
    ```
3.  The application should now be accessible at `http://localhost:3000` (or the port specified by your environment).

## 🧱 Project Structure

The codebase adheres to standard modern React/SPA practices, separating concerns to ensure maintainability and scalability.

*   **`src/`**: (The core logic)
    *   **Purpose:** Holds the main application source code.
    *   **Contents:** Main application logic (`App.tsx`), reusable components, state management setup, and primary styling. This is the primary area for feature development.
*   **`src/components/`**:
    *   **Purpose:** A collection of isolated, presentational UI components (e.g., `Button`, `Card`, `DataTable`).
    *   **Principle:** These components should be reusable, highly decoupled, and primarily focused on *how* things look.
*   **`src/hooks/`**:
    *   **Purpose:** Contains custom React hooks (e.g., `useBarcodeData`, `useMarketMetrics`).
    *   **Principle:** Used to encapsulate complex state logic and side effects, keeping components clean and focused on rendering.
*   **`src/services/`**:
    *   **Purpose:** Houses all API interaction logic.
    *   **Principle:** Abstracts away the raw network calls (e.g., `barcodeApi.js`, `metricApi.js`), allowing components to interact with business data without knowing the HTTP details.
*   **`public/`**:
    *   **Purpose:** Static assets available to the public, including favicons and global index files.
*   **`tests/`**:
    *   **Purpose:** Directory for unit and integration testing configurations, ensuring the reliability of the market analysis functionality.

## ⚙️ Technology Stack

*   **Framework:** React.js
*   **Language:** TypeScript (for enhanced type safety)
*   **Styling:** Tailwind CSS (Utility-first CSS framework)
*   **State Management:** *(Add details here if Redux, Context, or other methods are used)*
*   **Build Tool:** Vite / Webpack (Determined by `package.json`)

## 🎯 Key Features

*   [Placeholder: Add details on primary dashboard widgets]
*   [Placeholder: Add details on data visualization capabilities]
*   [Placeholder: Add details on search/lookup functionality]

***
*Generated with Claude Code.*