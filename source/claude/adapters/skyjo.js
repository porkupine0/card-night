// Claude adapter: Skyjo. Rules questions, and adding up a player's grid from a photo. Claude only reads the cards;
// the total (with three-of-a-kind columns cleared) is worked out here.
const AI = {
  game: "Skyjo",
  examples: ["Does a column of three 12s count as zero?", "What happens if I go out and someone ties my score?", "Can I swap a card that's already face up?", "Do negative cards clear a column too?"],
  count: {
    grid: {
      label: "📷 Count cards",
      title: i => `${state.players[i]}'s cards`,
      task: i => `This photo shows ${state.players[i]}'s Skyjo grid at the end of a round: up to 3 rows and 4 columns of cards numbered −2 to 12. Columns of three matching cards may already have been removed, leaving gaps. List every card still in the grid with its position (row 1 is the top row, column 1 the left column) and its number. If a card is still face down, set "face_down" true and "value" 0.
"found": false if the photo shows no Skyjo cards. "note": anything you weren't sure about, in one short sentence, or "".`,
      schema: { type: "object", additionalProperties: false, required: ["found", "note", "cards"], properties: { found: { type: "boolean" }, note: { type: "string" },
        cards: { type: "array", items: { type: "object", additionalProperties: false, required: ["row", "col", "value", "face_down"], properties: { row: { type: "integer" }, col: { type: "integer" }, value: { type: "integer" }, face_down: { type: "boolean" } } } } } },
      compute(r){
        const cell = {};
        (Array.isArray(r.cards) ? r.cards : []).forEach(c => { const row = Math.round(+c.row), col = Math.round(+c.col), v = Math.round(+c.value);
          if (row >= 1 && row <= 3 && col >= 1 && col <= 4 && (c.face_down || (v >= -2 && v <= 12)) && !cell[row + "-" + col]) cell[row + "-" + col] = { v, down: !!c.face_down }; });
        const cleared = [1, 2, 3, 4].filter(col => { const cs = [1, 2, 3].map(row => cell[row + "-" + col]); return cs.every(x => x && !x.down) && cs.every(x => x.v === cs[0].v); });
        let total = 0, down = 0;
        Object.entries(cell).forEach(([k, x]) => { if (x.down) down++; else if (!cleared.includes(+k.split("-")[1])) total += x.v; });
        return { cell, cleared, total, down, n: Object.keys(cell).length, note: String(r.note || "").trim().slice(0, 200),
          warn: down ? `${down === 1 ? "1 card is" : down + " cards are"} still face down and not counted. Turn ${down === 1 ? "it" : "them"} over and use a new photo, or add ${down === 1 ? "it" : "them"} in yourself.` : "" };
      },
      view: o => `<div class="cai-grid" style="grid-template-columns:repeat(4,44px)" role="img" aria-label="The grid as read from the photo">${[1, 2, 3].map(row => [1, 2, 3, 4].map(col => { const x = o.cell[row + "-" + col];
          return x ? `<span class="${x.down ? "q" : o.cleared.includes(col) ? "x" : ""}">${x.down ? "?" : x.v < 0 ? "−" + -x.v : x.v}</span>` : `<span class="x" aria-label="empty"></span>`; }).join("")).join("")}</div>
        ${o.cleared.length ? `<p class="cai-hint">Column ${o.cleared.join(" and ")}: three of a kind, cleared.</p>` : ""}
        <dl class="cai-sum"><dt>Cards counted</dt><dd>${o.n - o.down}</dd><dt>Total</dt><dd class="cai-big">${o.total < 0 ? "−" + -o.total : o.total}</dd></dl>
        ${o.note ? `<p class="cai-hint">ℹ️ ${esc(o.note)}</p>` : ""}`,
      useLabel: (o, i) => `Use ${o.total < 0 ? "−" + -o.total : o.total} for ${state.players[i]}`,
      apply(i, o){ if (!entry || entry.raw[i] == null) return; entry.raw[i] = String(o.total); entry.error = ""; render(); }
    }
  }
};
