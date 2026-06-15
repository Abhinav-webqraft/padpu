export function formatWeightLabel(grams: number | undefined, label: string): string {
  if (!grams) return label;
  
  // Preserve special labels
  if (label.includes('×') || label.toLowerCase().includes('set')) {
    return label;
  }

  if (grams >= 1000) {
    const kg = grams / 1000;
    return `${kg}kg`;
  }

  return `${grams}g`;
}
