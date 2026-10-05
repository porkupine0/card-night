// Claude adapter: Card Golf. Rules questions, and adding up a player's layout from a photo with this app's card
// values. Claude only reads the cards; the hole total is worked out here.
const GOLF_RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "Joker"];
const golfVal = rk => rk === "A" ? 1 : rk === "2" || rk === "Joker" ? -2 : rk === "K" ? 0 : rk === "J" || rk === "Q" ? 10 : +rk;
const AI = {
  game: "Card Golf",
  situation: () => state.phase === "play" && state.holes.length ? `The game in the app right now: ${state.holes.length} of 9 holes played. Totals: ${state.players.map((p, i) => `${p} ${state.holes.reduce((a, h) => a + h[i], 0)}`).join(", ")}.` : "",
  examples: ["Do two Kings in a column still score zero?", "Is a pair of 2s worth zero or −4?", "Does everyone get one more turn after someone goes out?", "Can I swap out a card that's already face up?"],
  count: {
    grid: {
      label: "📷 Count cards",
      title: i => `${state.players[i]}'s cards`,
      task: i => `This photo shows ${state.players[i]}'s Card Golf layout at the end of a hole, usually 2 rows of 3 cards (some groups play 4 or 9). List every card with its position (row 1 is the top row, column 1 the left column) and its rank. Use "Joker" for jokers. If a card is still face down, set "face_down" true and "rank" "A".
"found": false if the photo shows no playing cards. "note": anything you weren't sure about, in one short sentence, or "".`,
      schema: { type: "object", additionalProperties: false, required: ["found", "note", "cards"], properties: { found: { type: "boolean" }, note: { type: "string" },
        cards: { type: "array", items: { type: "object", additionalProperties: false, required: ["row", "col", "rank", "face_down"], properties: { row: { type: "integer" }, col: { type: "integer" }, rank: { type: "string", enum: GOLF_RANKS }, face_down: { type: "boolean" } } } } } },
      compute(r){
        const cell = {}; let rows = 0, cols = 0;
        (Array.isArray(r.cards) ? r.cards : []).forEach(c => { const row = Math.round(+c.row), col = Math.round(+c.col);
          if (row >= 1 && row <= 3 && col >= 1 && col <= 5 && GOLF_RANKS.includes(c.rank) && !cell[row + "-" + col]){ cell[row + "-" + col] = { rk: c.rank, down: !!c.face_down }; rows = Math.max(rows, row); cols = Math.max(cols, col); } });
        // a column whose cards all match scores 0 (the app's pair rule; three of a kind in a 9-card layout too)
        const matched = [];
        for (let col = 1; col <= cols; col++){ const cs = []; for (let row = 1; row <= rows; row++) if (cell[row + "-" + col]) cs.push(cell[row + "-" + col]);
          if (cs.length >= 2 && cs.every(x => !x.down && x.rk === cs[0].rk)) matched.push(col); }
        let total = 0, down = 0;
        Object.entries(cell).forEach(([k, x]) => { if (x.down) down++; else if (!matched.includes(+k.split("-")[1])) total += golfVal(x.rk); });
        return { cell, rows, cols, matched, total, down, n: Object.keys(cell).length, joker: Object.values(cell).some(x => x.rk === "Joker" && !x.down), note: String(r.note || "").trim().slice(0, 200),
          warn: down ? `${down === 1 ? "1 card is" : down + " cards are"} still face down and not counted. Turn ${down === 1 ? "it" : "them"} over and use a new photo, or add ${down === 1 ? "it" : "them"} in yourself.` : "" };
      },
      view: o => `<div class="cai-grid" style="grid-template-columns:repeat(${Math.max(1, o.cols)},44px)" role="img" aria-label="The layout as read from the photo">${Array.from({ length: o.rows }, (_, r) => Array.from({ length: o.cols }, (_, c) => { const x = o.cell[(r + 1) + "-" + (c + 1)];
          return x ? `<span class="${x.down ? "q" : o.matched.includes(c + 1) ? "x" : ""}">${x.down ? "?" : x.rk === "Joker" ? "🃏" : x.rk}</span>` : `<span class="x" aria-label="empty"></span>`; }).join("")).join("")}</div>
        ${o.matched.length ? `<p class="cai-hint">Column ${o.matched.join(" and ")}: matching cards, 0 points.</p>` : ""}
        ${o.joker ? `<p class="cai-hint">Jokers are counted as −2, as in the How to play.</p>` : ""}
        <dl class="cai-sum"><dt>Cards counted</dt><dd>${o.n - o.down}</dd><dt>Hole total</dt><dd class="cai-big">${minus(o.total)}</dd></dl>
        ${o.note ? `<p class="cai-hint">ℹ️ ${esc(o.note)}</p>` : ""}`,
      useLabel: (o, i) => `Use ${minus(o.total)} for ${state.players[i]}`,
      apply(i, o){ if (!entry || entry.raw[i] == null) return; entry.raw[i] = String(o.total); entry.error = ""; render(); }
    }
  }
};
