import { isValidFechaFabricacion } from './fecha-fabricacion.validator';

describe('fecha-fabricacion.validator', () => {
  const referenceDate = new Date('2026-05-15T12:00:00.000Z');

  it('accepts a valid past YYYYMM date', () => {
    expect(isValidFechaFabricacion(202401, referenceDate)).toBe(true);
  });

  it('accepts current period', () => {
    expect(isValidFechaFabricacion(202605, referenceDate)).toBe(true);
  });

  it('rejects future periods', () => {
    expect(isValidFechaFabricacion(202606, referenceDate)).toBe(false);
  });

  it('rejects invalid month', () => {
    expect(isValidFechaFabricacion(202400, referenceDate)).toBe(false);
    expect(isValidFechaFabricacion(202413, referenceDate)).toBe(false);
  });

  it('rejects non-integer values', () => {
    expect(isValidFechaFabricacion(202401.5, referenceDate)).toBe(false);
  });
});
