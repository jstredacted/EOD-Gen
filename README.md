# End-of-Day Report Generator (Next.js Web App)

This project is a web application built with Next.js and shadcn/ui to interactively log daily tasks and generate end-of-day reports.

**Note:** The core application code resides in the `eodgen/` subdirectory.

## Getting Started

1.  **Navigate to the project directory:**
    ```bash
    cd eodgen
    ```

2.  **Install Dependencies:**
    *   If you primarily use npm:
        ```bash
        npm install
        ```
    *   If you primarily use yarn:
        ```bash
        yarn install
        ```
    *   If you primarily use pnpm:
        ```bash
        pnpm install
        ```

3.  **Run the Development Server:**
    *   If you use npm:
        ```bash
        npm run dev
        ```
    *   If you use yarn:
        ```bash
        yarn dev
        ```
    *   If you use pnpm:
        ```bash
        pnpm dev
        ```

4.  Open [http://localhost:3000](http://localhost:3000) (or the port indicated in your terminal) with your browser to see the application.

## Project Structure

*   `/eodgen`: Contains the Next.js application.
    *   `/eodgen/app`: Application routes and core layout.
    *   `/eodgen/components`: Reusable React components.
    *   `/eodgen/lib`: Utility functions.
    *   `/eodgen/public`: Static assets.
    *   ... (other Next.js standard files and generated shadcn files)
*   Files outside `/eodgen` (like `main.py`, `config.json`) are remnants of the previous Python version and are not directly used by the Next.js application.
