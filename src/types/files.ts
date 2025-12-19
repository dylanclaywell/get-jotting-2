export type File = {
  id: number
  name: string
  content: string
  folder_id: number | null
  created_at: string
  updated_at: string
}

export type FileSummary = {
  id: number
  name: string
  folder_id: number | null
  nest_level: number
  type: 'file'
}
