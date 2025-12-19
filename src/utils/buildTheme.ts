import { Nullish } from '../types/nullish'
import isValidHexColor from '../validation/isValidHexColor'
import { Theme, themeSchema } from '../validation/theme'

export function buildTheme(theme: Nullish<Theme>): Theme {
  const keys = Object.keys(themeSchema.shape)

  const completeTheme: Theme = {} as Theme

  console.log(theme)

  for (const key of keys) {
    const value = theme?.[key as keyof Theme]
    completeTheme[key as keyof Theme] = isValidHexColor(value)
      ? value
      : '#ffffff'
  }

  return completeTheme
}
