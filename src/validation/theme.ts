import z from 'zod'

export const themeSchema = z.object({
  background: z.string(),
  editorBackground: z.string(),

  activeTabBackground: z.string(),
  activeTabHighlight: z.string(),
  activeTabText: z.string(),

  inactiveTabBackground: z.string(),
  inactiveTabText: z.string(),

  editorText: z.string(),
  fileTreeBackground: z.string(),

  activeFileText: z.string(),
  activeFileBackground: z.string(),
  activeFileHoverBackground: z.string(),
  activeFileHoverText: z.string(),
  activeFolderText: z.string(),
  activeFolderBackground: z.string(),
  activeFolderHoverBackground: z.string(),
  activeFolderHoverText: z.string(),

  inactiveFileText: z.string(),
  inactiveFileBackground: z.string(),
  inactiveFileHoverBackground: z.string(),
  inactiveFileHoverText: z.string(),
  inactiveFolderText: z.string(),
  inactiveFolderBackground: z.string(),
  inactiveFolderHoverBackground: z.string(),
  inactiveFolderHoverText: z.string(),

  tabChangedIndicator: z.string(),
})

export type Theme = z.infer<typeof themeSchema>

export const themeOptionMapping: Record<keyof Theme, string> = {
  background: 'Background',
  editorBackground: 'Editor Background',

  activeTabBackground: 'Active Tab Background',
  activeTabHighlight: 'Active Tab Highlight',
  activeTabText: 'Active Tab Text',

  inactiveTabBackground: 'Inactive Tab Background',
  inactiveTabText: 'Inactive Tab Text',

  editorText: 'Editor Text',
  fileTreeBackground: 'File Tree Background',

  activeFileText: 'Active File Text',
  activeFileBackground: 'Active File Background',
  activeFileHoverBackground: 'Active File Hover Background',
  activeFileHoverText: 'Active File Hover Text',
  activeFolderText: 'Active Folder Text',
  activeFolderBackground: 'Active Folder Background',
  activeFolderHoverBackground: 'Active Folder Hover Background',
  activeFolderHoverText: 'Active Folder Hover Text',

  inactiveFileText: 'Inactive File Text',
  inactiveFileBackground: 'Inactive File Background',
  inactiveFileHoverBackground: 'Inactive File Hover Background',
  inactiveFileHoverText: 'Inactive File Hover Text',
  inactiveFolderText: 'Inactive Folder Text',
  inactiveFolderBackground: 'Inactive Folder Background',
  inactiveFolderHoverBackground: 'Inactive Folder Hover Background',
  inactiveFolderHoverText: 'Inactive Folder Hover Text',

  tabChangedIndicator: 'Tab Changed Indicator',
}
