# Make it yours

This is the map of my life right now. You should not have to keep it that way.

## The two files that matter

### Places

Open `src/data/places.ts`.

`LIVED` is where I have lived and for how long.

```ts
{
  id: "lived-phuket",
  kind: "lived",
  name: "Phuket, Thailand",
  meta: "12 years",
  lat: 7.89,
  lng: 98.39,
  distance: 2.78,
  detail: "Twelve years on Phuket — the longest chapter away from America.",
}
```

Change the name, the years, the sentence, and the latitude and longitude. A city search will give you the numbers. `distance` is how close the camera comes when you tap that place. Smaller means closer.

`COUNTRIES` and `TRAIL` are the stops. `rank` decides which names show first so they do not pile on top of each other. Use `1` for the names that must stay visible, `2` for the next layer, `3` for the small stops.

### Footprints

Open `src/data/footprints.ts`.

`WALKS` is a list of routes. Each route is a line of `[latitude, longitude]` pairs. The code fills in steps between those points. `step` is how far apart the footprints are, in degrees. A smaller number means more steps.

Ocean hops are `JUMPS`. Those are the places I left the ground and the line should arc instead of walking across the water.

If you only change the cities and you leave the walks alone, the steps will still follow my route. That is the gap. I want the steps to follow *your* cities by themselves. That work is an open issue. Until it is done, edit both files.

## What I would like you to keep

- Do not wipe someone else's story in a pull request to this repository. Fork it and make your copy yours.
- If you improve the globe for everyone, send that back here and tell me what you did.
- Leave the license file in place.

## Run what you changed

```bash
npm install
npm run dev
```

Drag the earth. Zoom in. Tap one of your places. If the name is missing or the steps walk through the ocean, open an issue and tell me the cities you used.
