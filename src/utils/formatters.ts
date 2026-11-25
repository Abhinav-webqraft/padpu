export const DEFAULT_STORE_SETTINGS = {
  phone: '7411860340',
  email: 'padpufarms@gmail.com',
  address: 'Padpu Farms Amaramudnuru Village Pailar Post Sullia Taluk Dakshina Kannada Dist Karnataka 574248',
  workingHours: 'Mon - Sat: 8:00 AM - 6:00 PM',
};

export function formatPhoneDisplay(raw: string | undefined | null): string {
  const digits = (raw || '').replace(/\D/g, '');
  if (!digits) return `+91 ${DEFAULT_STORE_SETTINGS.phone}`;
  const subscriber = digits.length >= 10 ? digits.slice(-10) : digits;
  return `+91 ${subscriber}`;
}

export function formatWhatsAppNumber(raw: string | undefined | null): string {
  const digits = (raw || '').replace(/\D/g, '');
  if (!digits) return `91${DEFAULT_STORE_SETTINGS.phone}`;
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

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
