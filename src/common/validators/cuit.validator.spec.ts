import { isValidCuit, normalizeCuit } from './cuit.validator';

describe('cuit.validator', () => {
  it('accepts a CUIT with valid verifier digit', () => {
    expect(isValidCuit('20123456786')).toBe(true);
  });

  it('accepts CUIT with separators after normalization', () => {
    expect(normalizeCuit('20-12345678-6')).toBe('20123456786');
    expect(isValidCuit('20-12345678-6')).toBe(true);
  });

  it('rejects invalid verifier digit', () => {
    expect(isValidCuit('20123456785')).toBe(false);
  });

  it('rejects wrong length', () => {
    expect(isValidCuit('2012345678')).toBe(false);
    expect(isValidCuit('201234567890')).toBe(false);
  });

  it('rejects non-numeric content', () => {
    expect(isValidCuit('20ABCDEF786')).toBe(false);
  });
});
