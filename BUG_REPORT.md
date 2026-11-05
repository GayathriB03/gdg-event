# Bug Report — GDG Event Finder

The previous development team left the app in an unstable state. These are the reported symptoms; the source code is yours to investigate.

## Incident 01 — Members cannot enter

- A valid test account is rejected.
- Check the Firebase Authentication call and the values passed into it.
- Confirm Email/Password is enabled in the Firebase console.

## Incident 02 — The events panel is empty

- Login may succeed, but the event list does not appear.
- Inspect the Firestore collection reference and the browser console.
- Confirm the collection and document fields match the setup guide.

## Incident 03 — Gemini is unreachable

- The assistant request fails even when the backend is running.
- Inspect the frontend Network tab and compare the requested path with the Express route.
- Then inspect the backend request sent to Gemini.

## Incident 04 — Gemini response cannot be displayed

- A successful HTTP response may still produce an empty assistant message.
- Inspect the JSON structure returned by Gemini and the code that reads it.

## Final objective

Once the complete flow works, the app will display the escape code. Do not hardcode the code into the UI; repair the data flow that reveals it.
