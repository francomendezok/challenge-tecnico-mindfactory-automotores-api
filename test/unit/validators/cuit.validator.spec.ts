import { isValidCuit, normalizeCuit } from '../../../src/common/validators/cuit.validator';

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

  it('accepts another valid CUIT (27 persona)', () => {
    expect(isValidCuit('27302878485')).toBe(true);
  });

  it('normalizes spaces and mixed separators', () => {
    expect(normalizeCuit(' 27 30287848 5 ')).toBe('27302878485');
  });

  it('rejects all same digit string of length 11', () => {
    expect(isValidCuit('11111111111')).toBe(false);
  });
});
