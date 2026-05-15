export function isValidFechaFabricacion(
  fecha: number,
  referenceDate: Date = new Date(),
): boolean {
  if (!Number.isInteger(fecha) || fecha < 190001 || fecha > 299912) {
    return false;
  }

  const year = Math.floor(fecha / 100);
  const month = fecha % 100;

  if (month < 1 || month > 12) {
    return false;
  }

  const currentYear = referenceDate.getFullYear();
  const currentMonth = referenceDate.getMonth() + 1;
  const currentPeriod = currentYear * 100 + currentMonth;

  return fecha <= currentPeriod;
}
