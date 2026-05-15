const CUIT_MULTIPLIERS = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2] as const;

export function normalizeCuit(cuit: string): string {
  return cuit.replace(/\D/g, '');
}

export function isValidCuit(cuit: string): boolean {
  const digits = normalizeCuit(cuit);

  if (!/^\d{11}$/.test(digits)) {
    return false;
  }

  let sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += Number(digits[i]) * CUIT_MULTIPLIERS[i];
  }

  const remainder = sum % 11;
  let verifier = 11 - remainder;

  if (verifier === 11) {
    verifier = 0;
  } else if (verifier === 10) {
    verifier = 9;
  }

  return verifier === Number(digits[10]);
}
