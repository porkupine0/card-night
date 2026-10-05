// Claude adapter: Mao. Rules questions (from the How to play only, so the secret rules in play stay secret), and new
// secret rules written to order, saved as starred house rules in the deck.
const AI = {
  game: "Mao",
  examples: ["What's the penalty for talking?", "Do I have to say Mao with one card left?", "Can a winner make a rule that only targets one player?", "How does Point of order work?"],
  fresh: {
    title: "New secret rules",
    blurb: "Tell Claude what you're in the mood for and it writes new secret rules for the deck.",
    placeholder: "e.g. sillier, something with face cards",
    chips: ["😂 Sillier", "🃏 Card triggers", "🗣️ Things to say", "🤫 Extra sneaky", "🧒 Family-friendly"],
    catName: c => CATS[c] || "House rule",
    schema: { type: "object", additionalProperties: false, required: ["rules"], properties: { rules: { type: "array", items: { type: "object", additionalProperties: false, required: ["title", "text", "category"],
      properties: { title: { type: "string" }, text: { type: "string" }, category: { type: "string", enum: Object.keys(CATS) } } } } } },
    task: (want, shown) => `Make up 4 new secret rules for this group's Mao rule deck${want ? `, in this spirit: “${want}”` : ""}.
- A secret rule is short and easy to check at the table: a card or an action triggers something players must say or do, a change to the turn order, or a penalty. Like these from the deck: ${RULES.slice(0, 5).map(([, t, d]) => `“${t}: ${d}”`).join(" ")}
- Give each a catchy name of 2 to 4 words and one sentence saying exactly what triggers it and what to do.
- Don't repeat or closely copy rules already in the deck: ${allRules().map(r => r.t).join(", ")}.${shown ? ` Make them different from these too: ${shown.map(r => r.title).join(", ")}.` : ""}
- ${state.sips ? "This group plays the drinking variant, so a rule can include a sip now and then. Never more than a sip." : "Leave drinking out of it."} Keep it fun for everyone: nothing mean, risky, or about anyone's body.`,
    clean: r => (Array.isArray(r.rules) ? r.rules : []).map(x => ({ title: String((x && x.title) || "").trim().slice(0, 40), text: String((x && x.text) || "").trim().slice(0, 240), category: x && CATS[x.category] ? x.category : "do" })).filter(x => x.title && x.text).slice(0, 6),
    add(list){
      const now = Date.now().toString(36);
      list.forEach((r, k) => { const id = "h-" + slug(r.title) + "-" + now + k; prefs.custom.push({ id, c: r.category, t: r.title, d: r.text }); prefs.favs[id] = true; });
      savePrefs(); render();
    }
  },
  mount(api){ const base = deckView; deckView = function(){ return api.freshCard() + base.apply(this, arguments); }; }
};
