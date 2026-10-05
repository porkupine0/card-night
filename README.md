# Card Night

One Home Screen icon for every card game score keeper: Card Golf, Casino, Cribbage, Euchre, Flip 7, Hand & Foot, Hearts, Mao, Pitch, Presidents, Skyjo, Spades and Up & Down the River.

**Open it:** https://porkupine0.github.io/card-night/

- Tap a game to play it. A **‹ All games** link at the top of the game brings you back.
- **Pick up where you left off** shows the game you were last playing.
- Each tile shows how many games are in that game's History and when you last played.
- **History & backup:** one backup file covers all 13 games. Restore adds back any games the phone doesn't have and leaves the rest alone.
- Works offline: the first visit saves Card Night and all 13 games on the phone, including games you haven't opened yet.

## Claude helper (optional)

With your own Claude API key, the games get a few extras. Paste the key once, in Card Night (**Claude helper → Add your key**) or in any game's **How to play → Ask**, and every game can use it.

- **Ask about the rules (every game):** How to play has an Ask box. Claude answers from that game's own How to play and settings, and quotes the rule that settles it. When the app's rules don't cover something, it says so and gives the usual way to play it.
- **Count my cards (Hand & Foot, Skyjo, Card Golf):** when you score a round, the 📷 buttons read the cards from a photo. Claude only reads the cards; the app adds up the points with its own card values and fills them in for you to check. Photos are never saved.
- **New rules (Mao, Presidents):** the rule deck can write new rules to order ("sillier", "for the President"), saved as starred house rules. Asking about the rules in Mao never sends the secret rules in play.

The key stays on the phone and isn't in any backup. Each question costs a few cents, billed by Anthropic. Without a key, nothing changes and nothing is sent.

## Put it on your phone

- **iPhone:** open the link in Safari, tap **Copy for Home Screen**, then Share → **Add to Home Screen**. Open Card Night from the Home Screen and tap **Paste History**. A Home Screen app keeps its own storage, separate from Safari, so this brings every game's History along in one go.
- **Games played from their own Home Screen icons** keep their History in that icon. Open the icon, tap History → **Copy History**, then tap **Paste History** in Card Night. (Or History → Share backup, and Restore in Card Night.)
- **Android:** open the link in Chrome and tap **Install**, or ⋮ → **Install app**.

## How it works

The games are separate apps on the same site (`porkupine0.github.io/<game>/`). The manifest's scope is the whole site, so games opened from Card Night stay inside the Card Night app and share its storage. Each game keeps its own History under its own key (`<game>-history-v1`), and Card Night reads and backs up those same keys. Each game also keeps its own offline copy with its own service worker; Card Night registers all of them on its first visit.

The Claude key is kept in one localStorage slot, `cards-claude-key`, that every game on the site reads. In Safari and inside the Card Night app that's one shared storage, so one paste covers all 13 games; a game opened from its own Home Screen icon has its own storage and needs the key pasted there once. The official Anthropic SDK (`vendor/anthropic-sdk-0.131.0.js`, MIT license in `vendor/anthropic-sdk-LICENSE.txt`) lives here, and every game loads it from `/card-night/vendor/` only when Claude is used.

The helper is one shared piece of code built into every game. Its source is in `source/claude/`: `ai-module.js` and `ai.css` are the same in every game, and `adapters/<id>.js` holds each game's part (its examples, card counting or rule writing). To change it, edit those files and run `node source/claude/ai-inject.js ../<Game-folder> source/claude/adapters/<id>.js` for each game (it replaces the fenced `ai:` blocks, so it can be run again).

GitHub Pages serves the site from the `gh-pages` branch, so push changes to both branches:

```
git push origin main main:gh-pages
```

The app icon ("suit candy") is drawn by `source/make-icons.js` (`node source/make-icons.js`, needs Playwright); its file names carry a version so phones never reuse an old cached icon. The game tiles use each game's own icon, copied into `icons/`.
