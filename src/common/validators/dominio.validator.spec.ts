import { isValidDominio, normalizeDominio } from './dominio.validator';

describe('dominio.validator', () => {
  it('accepts formato viejo AAA999', () => {
    expect(isValidDominio('ABC123')).toBe(true);
  });

  it('accepts formato Mercosur AA999AA', () => {
    expect(isValidDominio('AB123CD')).toBe(true);
  });

  it('normalizes lowercase input', () => {
    expect(normalizeDominio(' abc123 ')).toBe('ABC123');
    expect(isValidDominio('ab123cd')).toBe(true);
  });

  it('rejects invalid patterns', () => {
    expect(isValidDominio('A123456')).toBe(false);
    expect(isValidDominio('ABC12')).toBe(false);
    expect(isValidDominio('1234ABC')).toBe(false);
    expect(isValidDominio('')).toBe(false);
  });
});
