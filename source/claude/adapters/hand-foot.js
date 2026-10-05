// Claude adapter: Hand & Foot. Rules questions, and counting a team's books and melds, or the cards left in its
// hands and feet, from a photo. Claude only reads the cards; the points are added up here with this app's values.
const HF_NAME = { A:"Aces", K:"Kings", Q:"Queens", J:"Jacks", "10":"10s", "9":"9s", "8":"8s", "7":"7s", "6":"6s", "5":"5s", "4":"4s" };
const hfInt = v => Math.max(0, Math.min(60, Math.round(+v || 0)));
const AI = {
  game: "Hand & Foot",
  examples: ["Can we go out with only dirty books?", "Can a meld have as many wild cards as natural ones?", "Do our red 3s count if we're the team that went out?", "Can I pick up the discard pile?"],
  extra: () => rulesCard(),
  count: {
    table: {
      label: "📷 Books & melds",
      title: i => `${teamName(state.teams, i)}: books and melds`,
      task: i => `This photo shows the books and melds ${teamName(state.teams, i)} laid down this round in Hand & Foot. List every meld you can see: its rank, and how many natural cards, 2s and jokers are in it. Count fanned or overlapping cards by their corners. A squared-up book may show only its top card: count it as 7 cards, and as clean if the top card is a natural card of that rank, unless you can see otherwise.
"found": false if the photo shows no melds. "note": anything you weren't sure about, in one short sentence, or "".`,
      schema: { type: "object", additionalProperties: false, required: ["found", "note", "melds"], properties: { found: { type: "boolean" }, note: { type: "string" },
        melds: { type: "array", items: { type: "object", additionalProperties: false, required: ["rank", "naturals", "twos", "jokers"], properties: { rank: { type: "string", enum: Object.keys(HF_NAME) }, naturals: { type: "integer" }, twos: { type: "integer" }, jokers: { type: "integer" } } } } } },
      compute(r){
        const val = rk => rk === "A" ? 20 : ["K", "Q", "J", "10"].includes(rk) ? 10 : 5;
        const melds = (Array.isArray(r.melds) ? r.melds : []).filter(m => m && HF_NAME[m.rank]).map(m => ({ rank: m.rank, nat: hfInt(m.naturals), wild: hfInt(m.twos) + hfInt(m.jokers) })).filter(m => m.nat + m.wild > 0).slice(0, 30);
        let clean = 0, dirty = 0, sevens = 0, table = 0;
        melds.forEach(m => { m.book = m.nat + m.wild >= 7; table += m.nat * val(m.rank) + m.wild * 50;
          if (m.book){ if (!m.wild && m.rank === "7") sevens++; else if (!m.wild) clean++; else dirty++; } });
        const odd = melds.filter(m => m.wild >= m.nat).map(m => HF_NAME[m.rank]);
        return { melds, clean, dirty, sevens, table, note: String(r.note || "").trim().slice(0, 200), warn: odd.length ? `Check the ${odd.join(" and ")}: a meld needs more natural cards than wild ones.` : "" };
      },
      view: o => `<dl class="cai-sum">${o.melds.map(m => `<dt>${HF_NAME[m.rank]}: ${m.nat} natural${m.wild ? ` + ${m.wild} wild` : ""}</dt><dd>${m.book ? (m.wild ? "dirty book" : m.rank === "7" ? "clean 7s book" : "clean book") : "meld"}</dd>`).join("")}</dl>
        <dl class="cai-sum"><dt>Clean books</dt><dd>${o.clean}</dd><dt>Dirty books</dt><dd>${o.dirty}</dd><dt>Clean 7s books</dt><dd>${o.sevens}</dd><dt>Points on the table</dt><dd class="cai-big">${fmt(o.table)}</dd></dl>
        ${o.note ? `<p class="cai-hint">ℹ️ ${esc(o.note)}</p>` : ""}`,
      useLabel: (o, i) => `Use these for ${teamName(state.teams, i)}`,
      apply(i, o){ if (!entry || !entry.t[i]) return; Object.assign(entry.t[i], { clean: o.clean, dirty: o.dirty, sevens: o.sevens, table: String(o.table) }); entry.error = ""; render(); }
    },
    hand: {
      label: "📷 Hand & foot",
      title: i => `${teamName(state.teams, i)}: cards left over`,
      task: i => `This photo shows the cards left in ${teamName(state.teams, i)}'s hands and feet at the end of a Hand & Foot round, both partners' cards together. Count them by kind: jokers, 2s, Aces, 10s through Kings, 4s through 9s, black 3s and red 3s.
"found": false if the photo shows no cards. "note": anything you weren't sure about, in one short sentence, or "".`,
      schema: { type: "object", additionalProperties: false, required: ["found", "note", "jokers", "twos", "aces", "tens_to_kings", "fours_to_nines", "black_threes", "red_threes"],
        properties: { found: { type: "boolean" }, note: { type: "string" }, jokers: { type: "integer" }, twos: { type: "integer" }, aces: { type: "integer" }, tens_to_kings: { type: "integer" }, fours_to_nines: { type: "integer" }, black_threes: { type: "integer" }, red_threes: { type: "integer" } } },
      compute(r){
        const c = { jokers: hfInt(r.jokers), twos: hfInt(r.twos), aces: hfInt(r.aces), high: hfInt(r.tens_to_kings), low: hfInt(r.fours_to_nines), black: hfInt(r.black_threes), red: hfInt(r.red_threes) };
        return { ...c, points: 50 * (c.jokers + c.twos) + 20 * c.aces + 10 * c.high + 5 * (c.low + c.black), note: String(r.note || "").trim().slice(0, 200), warn: "" };
      },
      view: o => `<dl class="cai-sum"><dt>Jokers and 2s</dt><dd>${o.jokers + o.twos}</dd><dt>Aces</dt><dd>${o.aces}</dd><dt>10s through Kings</dt><dd>${o.high}</dd><dt>4s through 9s</dt><dd>${o.low}</dd><dt>Black 3s</dt><dd>${o.black}</dd>
        <dt>Points left in hand &amp; foot</dt><dd class="cai-big">${fmt(o.points)}</dd><dt>Red 3s held</dt><dd>${o.red}</dd></dl>
        ${o.red ? `<p class="cai-hint">Red 3s cost 500 each if another team went out. The app works that out from who went out.</p>` : ""}
        ${o.note ? `<p class="cai-hint">ℹ️ ${esc(o.note)}</p>` : ""}`,
      useLabel: (o, i) => `Use these for ${teamName(state.teams, i)}`,
      apply(i, o){ if (!entry || !entry.t[i]) return; Object.assign(entry.t[i], { hand: String(o.points), red3: o.red }); entry.error = ""; render(); }
    }
  }
};
