// Claude adapter: Casino. Rules questions, answered from the How to play and this table's scoring settings.
const AI = {
  game: "Casino",
  examples: ["Can I build on someone else's build?", "Who gets the cards left on the table at the end?", "Does a sweep score a point?", "Can I capture a build with a card I just played?"],
  extra: () => rulesCard(state.phase === "play" ? state.rules : state.setup.rules)
};
