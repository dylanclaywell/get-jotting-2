<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Menu } from '@tauri-apps/api/menu'
import { message } from '@tauri-apps/plugin-dialog'
import { X, File as FileIcon } from 'lucide-vue-next'

import Folder from '../components/folder.vue'
import File from '../components/file.vue'
import db from '../services/db'
import { FolderSummary } from '../types/folders'
import { FileSummary, type File as FileType } from '../types/files'
import { getCurrentTheme } from '../services/theme'
import { buildTheme } from '../utils/buildTheme'
import { setCssThemeVariables } from '../utils/setCssThemeVariables'

const files = ref<FileSummary[]>([])
const folders = ref<FolderSummary[]>([])

const tabs = ref<FileType[]>([])
const activeTab = ref<number | null>(null)

const folderViewState = ref<Record<number, boolean>>({})

const isResizingFileTree = ref(false)
const fileTreeRef = ref<HTMLElement | null>(null)

const filesAndFolders = computed(() => {
  const combined: (FileSummary | FolderSummary)[] = [
    ...folders.value,
    ...files.value,
  ]

  // sort folders and files by name, folders first
  combined.sort((a, b) => {
    if (a.type === b.type) {
      return a.name.localeCompare(b.name)
    }
    return a.type === 'folder' ? -1 : 1
  })

  // sort files and folders directly under their parents
  const sorted: (FileSummary | FolderSummary)[] = []

  function addChildren(parentId: number | null, nestLevel: number) {
    combined
      .filter((item) =>
        parentId === null
          ? isFolder(item)
            ? item.parent_id === null
            : item.folder_id === null
          : isFolder(item)
          ? item.parent_id === parentId
          : item.folder_id === parentId
      )
      .forEach((item) => {
        sorted.push({
          ...item,
          nest_level: nestLevel,
        })
        if (isFolder(item)) {
          addChildren(item.id, nestLevel + 1)
        }
      })
  }

  addChildren(null, 0)
  return sorted
})

const tabChangeState = ref<Record<string, boolean>>({})

async function onRenameFile(id: number, filename: string) {
  await db.execute('UPDATE files SET name = ? WHERE id = ?', [filename, id])
  loadFiles()

  // Rename any open tabs with the new filename
  tabs.value = tabs.value.map((tab) =>
    tab.id === id ? { ...tab, name: filename } : tab
  )
}

async function onDeleteFile(id: number) {
  await db.execute('DELETE FROM files WHERE id = ?', [id])
  loadFiles()

  // If the deleted file is open in a tab, close that tab
  const tabIndex = tabs.value.findIndex((t) => t.id === id)
  if (tabIndex !== -1) {
    closeTab(tabs.value[tabIndex])
  }
}

async function onClickFile(id: number) {
  const existingTab = tabs.value.find((t) => t.id === id)

  if (existingTab) {
    activeTab.value = id
    return
  }

  const file = await db.select<FileType[]>('SELECT * FROM files WHERE id = ?', [
    id,
  ])

  if (!file.length) return

  if (!tabs.value.find((t) => t.id === id)) {
    tabs.value.push(file[0])
  }
  activeTab.value = id
}

async function onRenameFolder(id: number, folderName: string) {
  await db.execute('UPDATE folders SET name = ? WHERE id = ?', [folderName, id])
  loadFolders()
}

async function onDeleteFolder(id: number) {
  await db.execute('DELETE FROM folders WHERE id = ?', [id])
  loadFolders()
}

async function onClickFolder(id: number) {
  folderViewState.value[id] = !folderViewState.value[id]

  function toggleChildren(parentId: number) {
    folders.value
      .filter((folder) => folder.parent_id === parentId)
      .forEach((childFolder) => {
        folderViewState.value[childFolder.id] = folderViewState.value[parentId]
        toggleChildren(childFolder.id)
      })
  }

  // Hide all child folders if the parent is being closed
  if (folderViewState.value[id] === false) toggleChildren(id)
}

function closeTab(tab: FileType) {
  tabs.value = tabs.value.filter((t) => t.id !== tab.id)

  if (activeTab.value === tab.id) {
    activeTab.value = tabs.value.length
      ? tabs.value[tabs.value.length - 1].id
      : null
  }
}

async function onTabClose(tab: FileType) {
  if (tabChangeState.value[tab.id]) {
    const response = await message(
      'You have unsaved changes. Are you sure you want to close this tab?',
      {
        title: 'Unsaved Changes',
        okLabel: 'Close',
        buttons: {
          yes: 'Save',
          no: 'Close Without Saving',
          cancel: 'Cancel',
        },
      }
    )

    if (response === 'Save') {
      await db.execute('UPDATE files SET content = ? WHERE id = ?', [
        tab.content,
        tab.id,
      ])
      tabChangeState.value[tab.id] = false
    } else if (response === 'Cancel') {
      return
    } else if (response === 'Close Without Saving') {
      tabChangeState.value[tab.id] = false
    }
  }

  closeTab(tab)
}

async function handleFileContextMenu(event: MouseEvent) {
  const fileMenu = Menu.new({
    id: 'file-menu',
    items: [
      {
        id: 'new-file',
        text: 'New File',
        action: async () => {
          await db.execute('INSERT INTO files (name, content) VALUES (?, ?)', [
            `untitled`,
            '',
          ])
          loadFiles()
        },
      },
      {
        id: 'new-folder',
        text: 'New Folder',
        action: async () => {
          await db.execute('INSERT INTO folders (name) VALUES (?)', [
            `untitled`,
          ])
          loadFolders()
        },
      },
    ],
  })

  event.preventDefault()
  event.stopPropagation()
  ;(await fileMenu).popup()
}

function onNewNestedFile(parentId: number) {
  db.execute('INSERT INTO files (name, content, folder_id) VALUES (?, ?, ?)', [
    `untitled`,
    '',
    parentId,
  ]).then(() => {
    loadFiles()
  })

  // Ensure the parent folder is open to show the new file
  if (!folderViewState.value[parentId]) {
    folderViewState.value[parentId] = true
  }
}

function onNewNestedFolder(parentId: number) {
  db.execute('INSERT INTO folders (name, parent_id) VALUES (?, ?)', [
    `untitled`,
    parentId,
  ]).then(() => {
    loadFolders()
  })

  // Ensure the parent folder is open to show the new folder
  if (!folderViewState.value[parentId]) {
    folderViewState.value[parentId] = true
  }
}

function isFolder(item: FileSummary | FolderSummary): item is FolderSummary {
  return item.type === 'folder'
}

function onTextAreaInput(event: Event) {
  const target = event.target as HTMLTextAreaElement
  const content = target.value

  if (activeTab.value === null) return

  const tabIndex = tabs.value.findIndex((t) => t.id === activeTab.value)
  if (tabIndex === -1) return

  tabs.value[tabIndex].content = content

  tabChangeState.value[activeTab.value] = true
}

async function onSave() {
  await db.execute('UPDATE files SET content = ? WHERE id = ?', [
    tabs.value.find((t) => t.id === activeTab.value)?.content,
    activeTab.value,
  ])

  if (activeTab.value !== null) tabChangeState.value[activeTab.value] = false
}

async function loadFiles() {
  files.value = await db.select<FileSummary[]>(
    "SELECT id, name, folder_id, 'file' as type FROM files"
  )
}

async function loadFolders() {
  folders.value = await db.select<FolderSummary[]>(
    "SELECT id, name, parent_id, 'folder' as type FROM folders"
  )
}

async function loadTheme() {
  const currentTheme = await getCurrentTheme()
  const builtTheme = buildTheme(currentTheme)

  setCssThemeVariables(builtTheme)
}

function onFileTreeMouseDown() {
  isResizingFileTree.value = true
}

function onMouseUp() {
  isResizingFileTree.value = false
}

function onMouseMove(event: MouseEvent) {
  if (!isResizingFileTree.value) return

  const newWidth = event.clientX
  const minWidth = 150 // Minimum width in pixels
  const maxWidth = 600 // Maximum width in pixels

  if (newWidth >= minWidth && newWidth <= maxWidth) {
    const fileTreeElement = fileTreeRef.value
    if (fileTreeElement) {
      fileTreeElement.style.width = `${newWidth}px`
    }
  }
}

function onMouseLeave() {
  isResizingFileTree.value = false
}

onMounted(async () => {
  await loadFiles()
  await loadFolders()
  await loadTheme()
})
</script>

<template>
  <main
    :class="[
      'flex',
      {
        'select-none': isResizingFileTree,
      },
    ]"
    @keydown.ctrl.s.prevent="onSave"
    @mousemove="onMouseMove"
    @mouseup="onMouseUp"
    @mouseleave="onMouseLeave"
  >
    <div class="flex relative">
      <div
        ref="fileTreeRef"
        class="filetree h-screen pt-12 border- border-gray-200 z-10 overflow-auto min-w-40 relative"
        @contextmenu="handleFileContextMenu"
      >
        <div v-for="fileOrFolder in filesAndFolders" class="w-full">
          <folder
            v-if="isFolder(fileOrFolder)"
            v-show="
              fileOrFolder.parent_id === null ||
              folderViewState[fileOrFolder.parent_id]
            "
            :buttonStyle="{
              'padding-left': `${(fileOrFolder.nest_level + 0.5) * 1}rem`,
            }"
            :key="`folder-${fileOrFolder.id}`"
            :folder="fileOrFolder"
            :isOpen="folderViewState[fileOrFolder.id]"
            @rename="onRenameFolder"
            @click="onClickFolder"
            @delete="onDeleteFolder"
            @new-file="onNewNestedFile"
            @new-folder="onNewNestedFolder"
          />
          <file
            v-else-if="!isFolder(fileOrFolder)"
            v-show="
              fileOrFolder.folder_id === null ||
              folderViewState[fileOrFolder.folder_id]
            "
            :buttonStyle="{
              'padding-left': `${(fileOrFolder.nest_level + 0.5) * 1}rem`,
            }"
            :key="`file-${fileOrFolder.id}`"
            :file="fileOrFolder"
            :is-active="activeTab === fileOrFolder.id"
            @rename="onRenameFile"
            @click="onClickFile"
            @delete="onDeleteFile"
          />
        </div>
      </div>
      <div
        class="absolute bg-blck -right-1 w-2 h-screen z-20 cursor-col-resize flex justify-center"
        @mousedown="onFileTreeMouseDown"
      >
        <div class="bg-gray-200 w-px h-full"></div>
      </div>
    </div>
    <div class="w-full h-screen bg-gray-30">
      <div class="w-full shadow-md bg-white flex h-12 pl-2 pt-2">
        <div
          v-for="tab in tabs"
          :class="[
            'w-fit first:border-l border-r border-gray-300 p-2 min-w-36 flex justify-between items-center',
            {
              activeTab: activeTab === tab.id,
              'border-t': activeTab !== tab.id,
            },
          ]"
          @click.left="activeTab = tab.id"
          @click.middle.prevent="onTabClose(tab)"
        >
          <button
            @click="activeTab = tab.id"
            :class="{
              'text-gray-400': activeTab !== tab.id,
              'border-b-2 border-pink-500': tabChangeState[tab.id],
            }"
          >
            {{ tab.name }}
          </button>
          <button
            :aria-label="`Close file filename`"
            class="rounded-full hover:bg-gray-200 w-5 h-5 flex items-center justify-center"
            title="Close"
            @click.stop="onTabClose(tab)"
          >
            <X
              :class="[
                'w-4',
                {
                  'text-gray-400 hover:text-gray-600': activeTab !== tab.id,
                },
              ]"
            />
          </button>
        </div>
      </div>
      <textarea
        v-if="activeTab"
        class="w-full h-[calc(100%-3.5rem)] resize-none outline-none p-2"
        :value="tabs.find((t) => t.id === activeTab)?.content"
        @input="onTextAreaInput"
      />
      <div
        v-else
        class="flex items-center justify-center h-[calc(100%-3rem)] flex-col"
      >
        <FileIcon class="w-12 h-12 text-gray-400" />
        <p class="p-4 text-gray-500">No file opened</p>
      </div>
    </div>
  </main>
</template>

<style scoped>
main {
  background: var(--theme-background, var(--color-white));
}

.filetree {
  background: var(--theme-file-tree-background, var(--color-white));
}

.activeTab {
  box-shadow: inset 0 3px 0 0
    var(--theme-active-tab-highlight, var(--color-pink-500));
  background: var(--theme-active-tab);
}
</style>
