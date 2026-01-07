<script lang="ts" setup>
import { confirm } from '@tauri-apps/plugin-dialog'
import { Menu } from '@tauri-apps/api/menu'
import { ChevronRight, ChevronDown } from 'lucide-vue-next'
import { HTMLAttributes, nextTick, ref, watch } from 'vue'

import { FolderSummary } from '../types/folders'

type Props = {
  folder: FolderSummary
  isOpen: boolean
  buttonStyle?: HTMLAttributes['style']
}

type Emits = {
  click: [id: number]
  rename: [id: number, folderName: string]
  delete: [id: number]
  newFile: [parentId: number]
  newFolder: [parentId: number]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isEditing = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)

function rename(event: Event) {
  const target = event.target

  if (!(target instanceof HTMLInputElement)) return

  const newName = target.value.trim()

  isEditing.value = false

  if (!newName || newName === props.folder.name) {
    return
  }

  emit('rename', props.folder.id, newName)
}

async function onBlur(event: Event) {
  rename(event)
}

async function onEnter(event: Event) {
  rename(event)
}

async function handleFolderContextMenu(event: MouseEvent) {
  const folderMenu = Menu.new({
    id: 'folder-menu',
    items: [
      {
        id: 'new-file',
        text: 'New File',
        action: async () => {
          emit('newFile', props.folder.id)
        },
      },
      {
        id: 'new-folder',
        text: 'New Folder',
        action: async () => {
          emit('newFolder', props.folder.id)
        },
      },
      {
        id: 'rename',
        text: 'Rename',
        action: async () => {
          isEditing.value = true
        },
      },
      {
        id: 'delete',
        text: 'Delete',
        action: async () => {
          const shouldDelete = await confirm(
            'Are you sure you want to delete this folder?',
            {
              okLabel: 'Delete',
              title: 'Confirm Deletion',
              kind: 'warning',
            }
          )

          if (shouldDelete) {
            emit('delete', props.folder.id)
          }
        },
      },
    ],
  })

  event.preventDefault()
  event.stopPropagation()
  ;(await folderMenu).popup()
}

watch(isEditing, async (newVal) => {
  if (newVal) {
    await nextTick()
    inputRef.value?.focus()
    inputRef.value?.select()
  }
})
</script>

<template>
  <div>
    <input
      v-if="isEditing"
      ref="inputRef"
      class="ml-2 w-[calc(100%-1rem)]"
      :value="folder.name"
      @blur="onBlur"
      @keyup.enter="onEnter"
      @keyup.esc="isEditing = false"
    />
    <button
      v-else
      :class="[
        'flex cursor-pointer items-center whitespace-nowrap w-full',
        { 'active-folder': isOpen, 'inactive-folder': !isOpen },
      ]"
      :style="buttonStyle"
      @contextmenu="handleFolderContextMenu"
      @click="emit('click', folder.id)"
    >
      <ChevronDown v-if="isOpen" class="w-4 h-4 -ml-1 shrink-0" />
      <ChevronRight v-else class="w-4 h-4 -ml-1 shrink-0" /><span>{{
        folder.name
      }}</span>
    </button>
  </div>
</template>

<style scoped>
.active-folder {
  background: var(--theme-active-folder-background, var(--color-blue-100));
  color: var(--theme-active-folder-text, var(--color-black));
}

.active-folder:hover {
  background: var(
    --theme-active-folder-hover-background,
    var(--color-blue-100)
  );
  color: var(--theme-active-folder-hover-text, var(--color-black));
}

.inactive-folder {
  background: var(--theme-inactive-folder-background, var(--color-white));
  color: var(--theme-inactive-folder-text, var(--color-black));
}

.inactive-folder:hover {
  background: var(
    --theme-inactive-folder-hover-background,
    var(--color-gray-200)
  );
  color: var(--theme-inactive-folder-hover-text, var(--color-black));
}
</style>
