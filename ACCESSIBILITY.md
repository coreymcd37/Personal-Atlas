# Accessibility

I want this globe to be something more people can use, not only people who can drag a picture with a mouse. I have not finished that. This file is where I say what I know, and where you can tell me what I missed.

## What I care about first

1. You can reach the places and the key without guessing.
2. Text stays readable on the bright day globe and the dark night globe.
3. The names and the buttons do not overlap or fall off a phone screen.
4. If the 3D view fails you, there is still a list of the places.

## What works today

- The places list is real text. You can scroll it and tap a place.
- The key opens and closes from a button.
- The panel can drop down so the earth can use the screen.
- I respect a request for less motion when the browser asks for it.

## What does not work yet

- The globe itself is a picture you drag. A keyboard does not walk it.
- The names on the earth are drawn in the 3D scene. A screen reader does not read them.
- Zooming depends on a wheel, a pinch, or a double tap.
- I have not tested this with a screen reader or with switch access.

## If you hit a barrier

Open an issue and start the title with "Access:". Tell me:

- what you were trying to do
- what you use (keyboard, screen reader, phone, zoomed text)
- what happened

I will answer on that issue. If you can fix it, I want the pull request too.

## If you are changing the globe

- Do not take away the text list when you change the 3D view.
- Keep buttons large enough to tap.
- If you add a control, give it a name a screen reader can say.
- Check both the day look and the night look.
