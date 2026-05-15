const DOMINIO_REGEX = /^[A-Z]{3}\d{3}$|^[A-Z]{2}\d{3}[A-Z]{2}$/;

export function normalizeDominio(dominio: string): string {
  return dominio.trim().toUpperCase();
}

export function isValidDominio(dominio: string): boolean {
  return DOMINIO_REGEX.test(normalizeDominio(dominio));
}
