export function getOptions(defaultOptions: Record<string, string | number>, scopeOptions: Record<string, string | number>, scope?: string) {
  if (!scope) {
    return {where: defaultOptions};
  }

  return {where: {...defaultOptions, ...scopeOptions}};
}