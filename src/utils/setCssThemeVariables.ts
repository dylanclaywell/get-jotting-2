import { Theme } from '../validation/theme'

export function setCssThemeVariables(theme: Theme) {
  for (const [key, value] of Object.entries(theme)) {
    const cssVariableName = `--theme-${key
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase()}`
    document.documentElement.style.setProperty(cssVariableName, value)
  }
}
