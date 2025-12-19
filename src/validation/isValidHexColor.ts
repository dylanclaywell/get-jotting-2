export default function isValidHexColor(color: unknown): color is string {
  if (typeof color !== 'string') {
    return false
  }

  return /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/.test(color)
}
