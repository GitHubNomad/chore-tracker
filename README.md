# Family Chore Tracker

An interactive React app for kids to track chores, earn tickets, and redeem rewards. Installable as a PWA on any device.

## Features

### Chore Management

- 18 age-appropriate chores categorized by difficulty (Easy / Medium / Hard)
- Color-coded cards — Green (Easy), Yellow (Medium), Orange (Hard)
- Tap to mark complete; tap again to undo
- Weekly reset clears checkmarks without touching the ticket balance

### Ticket System

- Completing a chore immediately banks its tickets (1–4 per chore)
- Tickets persist across weekly resets — kids never lose what they've earned
- Unchecking a chore refunds its tickets

### Streak Tracking

- Tracks real consecutive days where at least one chore was completed
- Streak survives page reloads and weekly resets
- Today counts the moment the first chore of the day is checked off

### Virtual Store

- 10 rewards ranging from screen time to sleepovers
- Grayed-out items show exactly how many more tickets are needed
- Confirmation dialog prevents accidental purchases

### Achievements

- 8 unlockable badges (first chore, ticket milestones, streak goals, hard chores)
- Unlocks are permanent and saved to local storage

### PWA — Installable as an App

- Add to home screen on Android and iOS
- Installs on Windows/Mac desktop via Chrome or Edge
- Launches in a standalone window (no browser chrome)
- Works offline after the first load

### Dev Mode

- Click the "Family Chore Tracker" title **5 times** within 2 seconds to toggle Dev Mode
- Shows a red DEV badge in the nav and a banner with a **Reset All Progress** button
- Clears all chores, tickets, streak history, and achievements
- Not persisted — closes automatically on page refresh

## Quick Start

**Prerequisites:** Node.js v14+

```bash
git clone https://github.com/GitHubNomad/chore-tracker.git
cd chore-tracker
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment

Everything is already configured for GitHub Pages. Just run:

```bash
npm run deploy
```

This builds the app and pushes it to the `gh-pages` branch. The live URL is:
`https://GitHubNomad.github.io/chore-tracker`

## Installing as an App

**Desktop (Chrome / Edge):**
After opening the app, click the install icon (⊕) in the address bar.

**Android:**
Open in Chrome → three-dot menu → Add to Home Screen.

**iPhone / iPad:**
Open in Safari → Share button → Add to Home Screen.

## Customization

### Adding a chore

Edit the `chores` array in `src/App.js`:

```javascript
{ name: "Water the plants", category: "Easy", notes: "All indoor pots", tickets: 1, recurring: "daily" }
```

`category` must be `"Easy"`, `"Medium"`, or `"Hard"`. `recurring` is `"daily"`, `"weekly"`, or `"monthly"` (display only).

### Adding a store reward

Edit the `storeItems` array in `src/App.js`:

```javascript
{ id: 11, name: "New reward", cost: 8, emoji: "🎉", category: "Fun" }
```

### Ticket values

- Easy: 1 ticket
- Medium: 2 tickets
- Hard: 4 tickets

## Tech Stack

- React 18 with hooks
- Tailwind CSS v3
- Local Storage for persistence
- PWA (manifest + service worker) for installability
- Deployed via gh-pages to GitHub Pages

## License

MIT
