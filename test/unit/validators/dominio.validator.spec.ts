import { isValidDominio, normalizeDominio } from '../../../src/common/validators/dominio.validator';

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

  it('rejects Mercosur with letters in digit slots', () => {
    expect(isValidDominio('AB12C3D')).toBe(false);
  });

  it('rejects old format with only two letters prefix', () => {
    expect(isValidDominio('AB1234')).toBe(false);
  });

  it('accepts boundary old plate with digits 000', () => {
    expect(isValidDominio('AAA000')).toBe(true);
  });
});
