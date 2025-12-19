export type Folder = {
  id: number
  name: string
  parent_id: number | null
  created_at: string
  updated_at: string
}

export type FolderSummary = {
  id: number
  name: string
  parent_id: number | null
  nest_level: number
  type: 'folder'
}
