const categoryEmoji: Record<string, string> = {
  electronics: '\u{1F4F1}',
  clothing: '\u{1F45A}',
  books: '\u{1F4DA}',
  home: '\u{1F3E0}',
  sports: '\u{26BD}',
  food: '\u{1F34E}',
  beauty: '\u{2728}',
  toys: '\u{1F381}',
};

export const getPlaceholderEmoji = (categoryName?: string): string => {
  if (!categoryName) return '\u{1F6CD}';
  const key = categoryName.toLowerCase();
  for (const [k, v] of Object.entries(categoryEmoji)) {
    if (key.includes(k)) return v;
  }
  return '\u{1F6CD}';
};
