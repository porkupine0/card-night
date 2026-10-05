// Claude adapter: Presidents. Rules questions, and new rule cards written to order, saved as starred house rules.
const AI = {
  game: "Presidents",
  examples: ["Can I play a single on top of a pair?", "What happens if two players pass in a row?", "Does the President have to give up their best cards?", "How long does a rule stay in effect?"],
  extra: () => `<p>Ranks in this game: ${R().pres}, ${R().vp}, ${R().cit}, ${R().va}, ${R().ass}.</p>`,
  fresh: {
    title: "New rule cards",
    blurb: "Tell Claude what you're in the mood for and it writes new rules for the deck.",
    placeholder: "e.g. sillier, more power for the President",
    chips: ["😂 Sillier", "👑 President powers", "🗣️ Talking rules", "🙌 Body rules", "🚫 No drinking"],
    catName: c => CATS[c] || "House rule",
    schema: { type: "object", additionalProperties: false, required: ["rules"], properties: { rules: { type: "array", items: { type: "object", additionalProperties: false, required: ["title", "text", "how", "category"],
      properties: { title: { type: "string" }, text: { type: "string" }, how: { type: "string" }, category: { type: "string", enum: Object.keys(CATS) } } } } } },
    task: (want, shown) => `Make up 4 new rule cards for this group's ${R().title} rule deck${want ? `, in this spirit: “${want}”` : ""}. The President of the round puts rules in effect, and they last until repealed.
- Each card has a catchy name of 2 to 4 words, one sentence saying the rule ("text"), and a short "how it works" ("how") that settles the details: who checks, what counts, when it ends. Like these from the deck: ${RULES.slice(0, 3).map(([, t, d]) => `“${t}: ${d}”`).join(" ")}
- Use these rank names: ${R().pres}, ${R().vp}, ${R().cit}, ${R().va}, ${R().ass}.
- Don't repeat or closely copy rules already in the deck: ${allRules().map(r => r.t).join(", ")}.${shown ? ` Make them different from these too: ${shown.map(r => r.title).join(", ")}.` : ""}
- Breaking a rule usually costs a sip in this deck. Keep it to sips: never a whole drink, shots or chugging, and anyone can play with a soft drink. If they ask for no drinking, use other penalties, like taking a card or doing something silly. Keep it fun for everyone: nothing mean, risky, or about anyone's body.`,
    clean: r => (Array.isArray(r.rules) ? r.rules : []).map(x => ({ title: String((x && x.title) || "").trim().slice(0, 40), text: String((x && x.text) || "").trim().slice(0, 240), how: String((x && x.how) || "").trim().slice(0, 400), category: x && CATS[x.category] ? x.category : "wild" })).filter(x => x.title && x.text).slice(0, 6),
    add(list){
      const now = Date.now().toString(36);
      list.forEach((r, k) => { const id = "h-" + slug(r.title) + "-" + now + k; prefs.custom.push({ id, c: r.category, t: r.title, d: r.text, ...(r.how ? { x: r.how } : {}) }); prefs.favs[id] = true; });
      savePrefs(); render();
    }
  },
  mount(api){ const base = rulesView; rulesView = function(){ return api.freshCard() + base.apply(this, arguments); }; }
};
