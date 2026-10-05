// Claude adapter: Euchre. Rules questions, answered from the How to play and this table's scoring.
const AI = {
  game: "Euchre",
  examples: ["Is the left bower trump?", "What happens if we get euchred?", "What do we score for going alone?", "Can the dealer be stuck with picking trump?"],
  extra: () => rulesCard(true)
};
