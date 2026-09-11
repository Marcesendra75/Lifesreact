// ============================================
// LIFE'S — Formateo de números grandes (likes, comentarios, compartidos)
// Mismo criterio que Facebook/Instagram: a partir de 1000 se abrevia,
// así una publicación viral nunca "corre" el resto de los botones.
// ============================================
export function formatConteo(n: number): string {
  if (n < 1000) return String(n);

  if (n < 1_000_000) {
    const miles = n / 1000;
    const texto = miles >= 100
      ? Math.round(miles).toString()          // 999 mil, sin decimales a esa escala
      : (Number.isInteger(miles) ? miles.toString() : miles.toFixed(1)); // 1.6 mil
    return `${texto} mil`;
  }

  const millones = n / 1_000_000;
  const texto = Number.isInteger(millones) ? millones.toString() : millones.toFixed(1);
  return `${texto} M`;
}