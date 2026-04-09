export function lambdaBodyParser(body: string | null | undefined): Record<string, unknown> {
  if (!body) { return {}; }
  try {
    return JSON.parse(body);
  } catch {
    return Object.fromEntries(new URLSearchParams(body));
  }
}
