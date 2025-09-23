export function snakeToCamel(obj: unknown): unknown {
  if (!obj) return null;

  if (Array.isArray(obj)) {
    return obj.map((v) => snakeToCamel(v));
  } else if (obj !== null && obj.constructor === Object) {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [
        k.replace(/_([a-z])/g, (_, g) => g.toUpperCase()),
        snakeToCamel(v),
      ])
    );
  }
  return obj;
}
