# Prowider Mini Lead Distribution System

A robust, production-quality lead distribution platform built with Next.js 14, MongoDB Atlas, and Tailwind CSS. The system handles concurrent lead creation, distributes leads fairly using a persistent round-robin algorithm, and provides real-time updates to a provider dashboard.

## Tech Stack
*   **Frontend**: Next.js 14 (App Router), React, Tailwind CSS
*   **Backend**: Next.js API Routes
*   **Database**: MongoDB Atlas (Requires Replica Set for Transactions)
*   **ODM**: Mongoose

## Setup Instructions

1.  **Clone the repository** (or navigate to the project directory).
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Environment Variables**:
    Create a `.env.local` file in the root directory and add your MongoDB Atlas connection string.
    ```env
    MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
    ```
    *Note: A replica set is required for MongoDB transactions.*
4.  **Run the development server**:
    ```bash
    npm run dev
    ```
5.  **Seed the Database**:
    Navigate to `http://localhost:3000/api/seed` in your browser to initialize the providers and allocation states.

## Architecture & Logic

### Allocation Algorithm
Leads are assigned to exactly 3 providers based on `serviceType`:
1.  **Mandatory Providers**: Predefined providers that must receive leads for specific services (e.g., Provider 1 always gets Service 1).
2.  **Round-Robin Pool**: Remaining slots are filled by selecting eligible providers from a specific pool using a persistent round-robin algorithm.
3.  **Quota Checking**: Providers are skipped if they have reached their monthly quota (default 10).

### Concurrency Handling
The system handles simultaneous lead creations securely using **MongoDB Transactions**.
When a lead is submitted:
*   A transaction is started.
*   Quota increments (`$inc`), assignment insertions, and round-robin index updates are executed atomically.
*   Compound unique indexes prevent duplicate leads and duplicate assignments.
*   This prevents race conditions and quota overflows.

### Webhook Idempotency
The system includes a webhook endpoint to reset quotas (`/api/webhook/reset-quota`). Idempotency is enforced using a `ProcessedWebhook` collection. If multiple requests arrive with the same `webhookId`, only the first one processes the reset, and subsequent requests return an idempotent success response without executing the reset logic.

### Realtime Dashboard Updates
The `/dashboard` page uses short-polling (every 3 seconds) to fetch the latest provider data and assignments, ensuring real-time visibility without the complexity of WebSockets.

## Deployment Steps
1.  Push the code to a GitHub repository.
2.  Import the project into Vercel.
3.  Add the `MONGODB_URI` environment variable in Vercel settings.
4.  Deploy. (Vercel automatically detects Next.js).
