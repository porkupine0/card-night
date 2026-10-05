// Claude adapter: Spades. Rules questions, answered from the How to play and this table's house rules.
const AI = {
  game: "Spades",
  examples: ["Can I lead spades before they're broken?", "How do bags work?", "What does a nil bid score?", "Can my partner and I both bid nil?"],
  extra: () => rulesText(state.phase === "play" ? state.rules : state.setup.rules)
};
