# Bandsintown Demo - Postmodern Jukebox Events

A simple Next.js app that displays upcoming events for Postmodern Jukebox using the Bandsintown API, with live location filtering.

## Features

- 📅 Lists all upcoming events for Postmodern Jukebox
- 🔍 Live filtering by location (city, state, country, or venue name)
- 🎫 Direct links to ticket purchases
- 🎨 Clean, modern UI with Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ installed

### Installation

1. Install dependencies:
```bash
npm install
```

### Running the App

1. Start the development server:
```bash
npm run dev
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

**Note:** This app uses stubbed event data based on real Postmodern Jukebox events, so no API key is required!

### Building for Production

```bash
npm run build
npm start
```

## How It Works

- The app uses stubbed event data that matches the Bandsintown API response structure
- Events are fetched on page load from a Next.js API route and stored in React state
- The location filter uses live filtering - results update as you type
- Filtering searches across venue name, city, region, and country fields
- Event data is based on real Postmodern Jukebox events from their Bandsintown page

## Data Structure

The stubbed data follows the Bandsintown API response format with:
- Event ID, URL, and datetime
- Venue information (name, city, region, country, coordinates)
- Lineup information
- Ticket offers with URLs

