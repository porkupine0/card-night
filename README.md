# Card Night

One Home Screen icon for every card game score keeper: Card Golf, Casino, Cribbage, Euchre, Flip 7, Hand & Foot, Hearts, Mao, Pitch, Presidents, Skyjo, Spades and Up & Down the River.

**Open it:** https://porkupine0.github.io/card-night/

- Tap a game to play it. A **‹ All games** link at the top of the game brings you back.
- **Pick up where you left off** shows the game you were last playing.
- Each tile shows how many games are in that game's History and when you last played.
- **History & backup:** one backup file covers all 13 games. Restore adds back any games the phone doesn't have and leaves the rest alone.
- Works offline: the first visit saves Card Night and all 13 games on the phone, including games you haven't opened yet.

## Put it on your phone

- **iPhone:** open the link in Safari, tap **Copy for Home Screen**, then Share → **Add to Home Screen**. Open Card Night from the Home Screen and tap **Paste History**. A Home Screen app keeps its own storage, separate from Safari, so this brings every game's History along in one go.
- **Games played from their own Home Screen icons** keep their History in that icon. Open the icon, tap History → **Copy History**, then tap **Paste History** in Card Night. (Or History → Share backup, and Restore in Card Night.)
- **Android:** open the link in Chrome and tap **Install**, or ⋮ → **Install app**.

## How it works

The games are separate apps on the same site (`porkupine0.github.io/<game>/`). The manifest's scope is the whole site, so games opened from Card Night stay inside the Card Night app and share its storage. Each game keeps its own History under its own key (`<game>-history-v1`), and Card Night reads and backs up those same keys. Each game also keeps its own offline copy with its own service worker; Card Night registers all of them on its first visit.

GitHub Pages serves the site from the `gh-pages` branch, so push changes to both branches:

```
git push origin main main:gh-pages
```

Icons are drawn by `source/make-icons.js` (`node source/make-icons.js`, needs Playwright). The game tiles use each game's own icon, copied into `icons/`.
