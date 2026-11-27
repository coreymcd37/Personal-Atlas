# Personal Atlas

A free, open 3D globe you can make your own.

I built this so I could see the places I have lived and the places I have walked. The footprints on the earth are that walk. I am putting it out so anyone can use it, change it, and tell their own story with it.

You do not need to be able to build something like this from scratch. Fork it. Change the places. The rest of the globe is already here.

## What it is

- A full-screen globe you can drag, pinch, and zoom.
- Places I have lived, with how long I was there.
- Footprints between the cities and countries I have been.
- A key you can open and close.
- A day look and a night look. At night the cities carry the light.
- Tap a place and it tells you a little about it.

## What I want it to become

I do not want my life hardcoded as the only map.

I want the details to be easy to edit. I want someone to add the cities they care about, and I want the footprints to walk themselves between those cities. Lived, been, and want to go should all be able to sit on the same earth.

If you can picture a place but you cannot picture how to code a globe, this should still be a tool you can use.

## Make it yours

Today the story lives in two files:

- [`src/data/places.ts`](src/data/places.ts) is the names, the years, and the notes.
- [`src/data/footprints.ts`](src/data/footprints.ts) is the path the steps follow.

Read [docs/MAKE-IT-YOURS.md](docs/MAKE-IT-YOURS.md) before you change anything. It is the short version of how I would want a friend to start.

## Run it

You need Node.js 22.

```bash
npm install
npm run dev
```

Then open the local address the terminal prints. `npm run typecheck` checks the code. `npm run build` builds it.

## I am looking for help

I cannot finish the friendly version of this by myself. If you can code, design, write, or test, I want you here.

The open work is on the issues list. Start with anything marked **help wanted**. If you are new to this, start with **good first issue**.

When you make it yours, or when you fix something, tell me. Open an issue or a pull request and say what you changed. I read them.

- [How to help](CONTRIBUTING.md)
- [How we treat each other](CODE_OF_CONDUCT.md)
- [If something is hard to use](ACCESSIBILITY.md)
- [If you find a security problem](SECURITY.md)

## License

MIT. Use it, change it, share it. Keep the license with the code. See [LICENSE](LICENSE).

Corey McDaniel
