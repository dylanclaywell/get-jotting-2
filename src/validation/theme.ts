import z from 'zod'

export const themeSchema = z.object({
  background: z.string(),
  editorBackground: z.string(),

  activeTabBackground: z.string(),
  activeTabHighlight: z.string(),

  inactiveTabBackground: z.string(),
  editorText: z.string(),
  fileTreeBackground: z.string(),

  activeFileText: z.string(),
  activeFileBackground: z.string(),
  activeFolderText: z.string(),
  activeFolderBackground: z.string(),

  inactiveFileText: z.string(),
  inactiveFileBackground: z.string(),
  inactiveFolderText: z.string(),
  inactiveFolderBackground: z.string(),
})

export type Theme = z.infer<typeof themeSchema>
