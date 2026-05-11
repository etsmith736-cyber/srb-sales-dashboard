# SRB Sales Dashboard

A modern sales dashboard built with React, TypeScript, and Tailwind CSS that reads live data from Google Sheets. Features a React frontend with Recharts visualizations and a Node.js/Express backend with tRPC for secure Google Sheets API access.

## Features

- **Google Sheets Integration** - Reads live data from spreadsheet ID `143pCbA2rktBqI-t3EYUjZBiZNZv0i-WxuPobN9wKRW0`
- **Split Date Filtering** - Call metrics filter by appointment date (Column B), revenue metrics filter by date of purchase (Column R)
- **Multiple Filters** - Filter by Closer, Setter, Lead Source, Webinar ID, and Date Range
- **Sales Metrics** - Calls Booked, Show Rate, Close Rate, No-Show Rate, Cash Collected, Contracted Revenue, Avg Deal Size, Avg Cash Collected, Average Sales Cycle
- **Triage Dashboard** - Separate view for triage call performance
- **User Management** - Admin-controlled user access with bcrypt password hashing
- **Charts** - Closed Deals by Sales Rep, Contracted Revenue by Webinar, Roadmap Booked by Setter, Showed by Webinar
- **Data Table** - Full data table view with row highlighting

## Business Logic

- **Close Rate** = Closed / Showed (only counts rows where Column H = "Closed")
- **Average Sales Cycle** = Average days between appointment date (Col B) and purchase date (Col R), only for rows where H = "Closed" and both dates exist
- **Revenue metrics** count any row with cash collected (Col I) regardless of status
- **Call metrics** filter by appointment date; **Revenue metrics** filter by date of purchase

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Recharts, Lucide Icons, date-fns
- **Backend**: Node.js, Express, tRPC, Google Sheets API (googleapis)
- **Auth**: bcrypt password hashing, localStorage session management

## Setup

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in your Google API credentials
3. Install dependencies:

```bash
npm run install:all
```

4. Start development servers:

```bash
npm run dev
```

The client runs on `http://localhost:5173` and the server on `http://localhost:3001`.

## Default Login

- Email: `admin@risingventures.com`
- Password: `admin123`

## Deployment

Build the client and serve with the Express server:

```bash
npm run build
NODE_ENV=production npm start
```

## Live Demo

Currently deployed at: https://risingdash-h9cdnnvt.manus.space
