# MetroMitra Pune

A multilingual Pune Metro journey companion for riders and people new to Pune. It combines plain-language trip requests, place search, transit directions, fare information when the provider returns it, official ticket links, first-time rider guidance, saved trips, voice input, and an installable mobile web app.

## Run locally

Requires Node.js 20 or newer.

1. Run npm start.
2. Open http://localhost:3001 in your browser.
3. Search for Pune Metro stations and plan a station-to-station trip without adding any keys.

Google Maps and OpenAI credentials are optional. Add them to a private .env file when you want landmark search, provider route estimates, and AI trip parsing. Copy .env.example to .env, then set GOOGLE_MAPS_API_KEY (Places API and Routes API enabled) and OPENAI_API_KEY. The default local port is 3001; set PORT to choose a different port.

The browser never receives either secret. Restrict the Google key to the APIs this server uses, set provider quotas, and keep .env out of version control.

## Deploy

A Render Blueprint is included in render.yaml. Connect this folder to a Git repository, create the web service, and add the two secret values in the host's environment settings. Dockerfile is also included for container hosts.

## Data accuracy

- Place suggestions, route options, steps, and any fare shown are returned by Google Maps Platform when configured. Every result shows the time it was fetched. Transit coverage and live-update availability vary; estimates are not guaranteed train-control predictions.
- The app links to Pune Metro's official fare chart, timetable, station pages, commuter guide, and WhatsApp ticket channel. Ticket purchase remains on Pune Metro's official channel.
- Pune Metro's public site publishes passenger information, but this project has no official live train-position, disruption-feed, or station-crowd API connection. Crowding is explicitly shown as unavailable; no counts or alerts are fabricated. An authorized Maha Metro feed or integration agreement is required to make those fields live.
- The AI only extracts a rider's origin, destination, and preferences. Google place search resolves those locations and Google Routes computes directions; the model does not invent stops, platforms, fares, or arrival times.
- Saved trips stay in the browser's local storage. The app does not create rider accounts or transmit saved trips.
- The offline installable shell is cached; search, routing, AI, fare, and ticket services need an internet connection.

## Source links

- Pune Metro passenger information: https://www.punemetrorail.org/index.aspx
- Pune Metro station directory: https://www.punemetrorail.org/know-your-metro-stations
- Pune Metro fare chart: https://www.punemetrorail.org/fare_chart.aspx
- Google Routes API transit documentation: https://developers.google.com/maps/documentation/routes/transit-route
- OpenAI Responses API structured outputs: https://developers.openai.com/api/docs/guides/structured-outputs?api-mode=responses

## Offline station planning

Pune Metro station-to-station journeys can be planned without API credentials using the station order published on the official route map. Plans show the line, direction, transfer at District Court, and station sequence. They intentionally do not claim live arrivals, exact travel times, platform assignments, crowd levels, or a fare. Use the official links in the app to check current service and ticket information.

## Pull request workflow

Feature work belongs on a focused branch and should be proposed through a pull request into main. Review the full diff before merge. See CONTRIBUTING.md and the pull request checklist.
