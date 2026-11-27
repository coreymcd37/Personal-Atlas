# Personal Atlas

A free 3D globe for the places you have lived, the places you have been, and the places you still want to go.

I made this so I could see my own life on a map. The footprints are that walk. I left it open so you can take it, change the places, and make it yours. You do not need to know how to build a globe. That part is already here.

## What you can do

- Drag, pinch, and zoom the earth.
- Tap a place and read a short note.
- See where I lived, and for how long.
- Follow the footprints between the cities I have been.
- Open the key when you need it, and close it when you do not.
- Switch between day and night. At night, the cities light the earth.

## What I still want

My route is the example. It should not be the only map.

You should be able to add a city without opening a code file. The footprints should walk themselves from one place you chose to the next. Lived, been, and want to go should sit on the same earth, and they should not all look the same.

If you can picture the trip and you cannot picture the code, this should still work for you.

## Change the places

Two files hold the story today.

| File | What to edit |
| --- | --- |
| [src/data/places.ts](src/data/places.ts) | Names, years, and the note that shows when you tap a place |
| [src/data/footprints.ts](src/data/footprints.ts) | The path the steps follow |

Start with [docs/MAKE-IT-YOURS.md](docs/MAKE-IT-YOURS.md). That is the short version I would hand a friend.

## Run it

You need Node.js 22.

```bash
npm install
npm run dev
```

Open the address the terminal prints.

`npm run typecheck` checks the code. `npm run build` builds it.

## Help

I cannot finish the easy version of this by myself. If you code, design, write, or test, I want the help.

Look at the [issues](https://github.com/coreymcd37/Personal-Atlas/issues). Start with **help wanted**. If this is your first time, start with **good first issue**.

If you make a copy for yourself, or you fix something, tell me. Open an issue or a pull request and say what you changed. I read them.

- [How to help](CONTRIBUTING.md)
- [How we treat each other](CODE_OF_CONDUCT.md)
- [If something is hard to use](ACCESSIBILITY.md)
- [If you find a security problem](SECURITY.md)

## License

[MIT](LICENSE). Use it, change it, and share it. Keep the license with the code.

Corey McDaniel
