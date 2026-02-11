import { NextResponse } from 'next/server';

// Stubbed event data based on Postmodern Jukebox events from bandsintown.com
// Structure matches Bandsintown API response format
const stubEvents = [
  {
    id: "11902160-1736899200",
    url: "https://www.bandsintown.com/e/11902160-1736899200",
    datetime: "2025-01-15T19:00:00",
    venue: {
      name: "Merrill Auditorium",
      city: "Portland",
      region: "ME",
      country: "United States",
      latitude: "43.6591",
      longitude: "-70.2568"
    },
    lineup: ["Scott Bradlee's Postmodern Jukebox"],
    offers: [
      {
        type: "Tickets",
        url: "https://wl.eventim.us/event/scott-bradlees-postmodern-jukebox/671190?afflky=MassConcerts",
        status: "available"
      }
    ]
  },
  {
    id: "11902160-1737244800",
    url: "https://www.bandsintown.com/e/11902160-1737244800",
    datetime: "2025-01-19T19:30:00",
    venue: {
      name: "Culture and Congress Center Verkatehdas Ltd",
      city: "Hameenlinna",
      region: "",
      country: "Finland",
      latitude: "61.0000",
      longitude: "24.4500"
    },
    lineup: ["Scott Bradlee's Postmodern Jukebox"],
    offers: [
      {
        type: "Tickets",
        url: "https://wl.eventim.us/event/scott-bradlees-postmodern-jukebox/671190?afflky=MassConcerts",
        status: "available"
      }
    ]
  },
  {
    id: "11902160-1737331200",
    url: "https://www.bandsintown.com/e/11902160-1737331200",
    datetime: "2025-01-20T20:00:00",
    venue: {
      name: "House Of Culture",
      city: "Helsinki",
      region: "",
      country: "Finland",
      latitude: "60.1699",
      longitude: "24.9384"
    },
    lineup: ["Scott Bradlee's Postmodern Jukebox"],
    offers: [
      {
        type: "Tickets",
        url: "https://wl.eventim.us/event/scott-bradlees-postmodern-jukebox/671190?afflky=MassConcerts",
        status: "available"
      }
    ]
  },
  {
    id: "11902160-1737417600",
    url: "https://www.bandsintown.com/e/11902160-1737417600",
    datetime: "2025-01-21T19:30:00",
    venue: {
      name: "Tampere Hall",
      city: "Tampere",
      region: "",
      country: "Finland",
      latitude: "61.4978",
      longitude: "23.7609"
    },
    lineup: ["Scott Bradlee's Postmodern Jukebox"],
    offers: [
      {
        type: "Tickets",
        url: "https://wl.eventim.us/event/scott-bradlees-postmodern-jukebox/671190?afflky=MassConcerts",
        status: "available"
      }
    ]
  },
  {
    id: "11902160-1737504000",
    url: "https://www.bandsintown.com/e/11902160-1737504000",
    datetime: "2025-01-22T20:00:00",
    venue: {
      name: "Göta Lejon",
      city: "Stockholm",
      region: "",
      country: "Sweden",
      latitude: "59.3293",
      longitude: "18.0686"
    },
    lineup: ["Scott Bradlee's Postmodern Jukebox"],
    offers: [
      {
        type: "Tickets",
        url: "https://wl.eventim.us/event/scott-bradlees-postmodern-jukebox/671190?afflky=MassConcerts",
        status: "available"
      }
    ]
  },
  {
    id: "11902160-1737590400",
    url: "https://www.bandsintown.com/e/11902160-1737590400",
    datetime: "2025-01-23T19:00:00",
    venue: {
      name: "Theater am Aegi",
      city: "Hannover",
      region: "",
      country: "Germany",
      latitude: "52.3759",
      longitude: "9.7320"
    },
    lineup: ["Scott Bradlee's Postmodern Jukebox"],
    offers: [
      {
        type: "Tickets",
        url: "https://wl.eventim.us/event/scott-bradlees-postmodern-jukebox/671190?afflky=MassConcerts",
        status: "available"
      }
    ]
  },
  {
    id: "11902160-1738281600",
    url: "https://www.bandsintown.com/e/11902160-1738281600",
    datetime: "2025-01-31T20:00:00",
    venue: {
      name: "Royal Albert Hall",
      city: "London",
      region: "England",
      country: "United Kingdom",
      latitude: "51.5010",
      longitude: "-0.1774"
    },
    lineup: ["Scott Bradlee's Postmodern Jukebox"],
    offers: [
      {
        type: "Tickets",
        url: "https://wl.eventim.us/event/scott-bradlees-postmodern-jukebox/671190?afflky=MassConcerts",
        status: "available"
      }
    ]
  },
  {
    id: "11902160-1738368000",
    url: "https://www.bandsintown.com/e/11902160-1738368000",
    datetime: "2025-02-01T19:30:00",
    venue: {
      name: "Olympia Theatre",
      city: "Dublin",
      region: "",
      country: "Ireland",
      latitude: "53.3498",
      longitude: "-6.2603"
    },
    lineup: ["Scott Bradlee's Postmodern Jukebox"],
    offers: [
      {
        type: "Tickets",
        url: "https://wl.eventim.us/event/scott-bradlees-postmodern-jukebox/671190?afflky=MassConcerts",
        status: "available"
      }
    ]
  },
  {
    id: "11902160-1738454400",
    url: "https://www.bandsintown.com/e/11902160-1738454400",
    datetime: "2025-02-02T20:00:00",
    venue: {
      name: "The Fillmore",
      city: "San Francisco",
      region: "CA",
      country: "United States",
      latitude: "37.7749",
      longitude: "-122.4194"
    },
    lineup: ["Scott Bradlee's Postmodern Jukebox"],
    offers: [
      {
        type: "Tickets",
        url: "https://wl.eventim.us/event/scott-bradlees-postmodern-jukebox/671190?afflky=MassConcerts",
        status: "available"
      }
    ]
  },
  {
    id: "11902160-1738540800",
    url: "https://www.bandsintown.com/e/11902160-1738540800",
    datetime: "2025-02-03T19:00:00",
    venue: {
      name: "House of Blues",
      city: "Los Angeles",
      region: "CA",
      country: "United States",
      latitude: "34.0522",
      longitude: "-118.2437"
    },
    lineup: ["Scott Bradlee's Postmodern Jukebox"],
    offers: [
      {
        type: "Tickets",
        url: "https://wl.eventim.us/event/scott-bradlees-postmodern-jukebox/671190?afflky=MassConcerts",
        status: "available"
      }
    ]
  },
  {
    id: "11902160-1738627200",
    url: "https://www.bandsintown.com/e/11902160-1738627200",
    datetime: "2025-02-04T20:00:00",
    venue: {
      name: "Terminal 5",
      city: "New York",
      region: "NY",
      country: "United States",
      latitude: "40.7589",
      longitude: "-73.9851"
    },
    lineup: ["Scott Bradlee's Postmodern Jukebox"],
    offers: [
      {
        type: "Tickets",
        url: "https://wl.eventim.us/event/scott-bradlees-postmodern-jukebox/671190?afflky=MassConcerts",
        status: "available"
      }
    ]
  },
  {
    id: "11902160-1738713600",
    url: "https://www.bandsintown.com/e/11902160-1738713600",
    datetime: "2025-02-05T19:30:00",
    venue: {
      name: "The Vic Theatre",
      city: "Chicago",
      region: "IL",
      country: "United States",
      latitude: "41.8781",
      longitude: "-87.6298"
    },
    lineup: ["Scott Bradlee's Postmodern Jukebox"],
    offers: [
      {
        type: "Tickets",
        url: "https://wl.eventim.us/event/scott-bradlees-postmodern-jukebox/671190?afflky=MassConcerts",
        status: "available"
      }
    ]
  }
];

export async function GET() {
  // Return stubbed data matching Bandsintown API response structure
  return NextResponse.json(stubEvents);
}

