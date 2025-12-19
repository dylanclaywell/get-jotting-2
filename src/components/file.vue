<script lang="ts" setup>
import { confirm } from '@tauri-apps/plugin-dialog'
import { Menu } from '@tauri-apps/api/menu'
import { HTMLAttributes, nextTick, ref, watch } from 'vue'

import { FileSummary } from '../types/files'

type Props = {
  file: FileSummary
  buttonStyle?: HTMLAttributes['style']
  isActive: boolean
}

type Emits = {
  click: [id: number]
  rename: [id: number, filename: string]
  delete: [id: number]
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

  if (!newName || newName === props.file.name) {
    return
  }

  emit('rename', props.file.id, newName)
}

async function onBlur(event: Event) {
  rename(event)
}

async function onEnter(event: Event) {
  rename(event)
}

async function handleFileContextMenu(event: MouseEvent) {
  event.preventDefault()
  event.stopPropagation()

  const fileMenu = Menu.new({
    id: 'file-menu',
    items: [
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
            'Are you sure you want to delete this file?',
            {
              okLabel: 'Delete',
              title: 'Confirm Deletion',
              kind: 'warning',
            }
          )

          if (shouldDelete) {
            emit('delete', props.file.id)
          }
        },
      },
    ],
  })

  ;(await fileMenu).popup()
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
  <div class="">
    <input
      v-if="isEditing"
      ref="inputRef"
      class="ml-2 w-[calc(100%-1rem)]"
      :value="file.name"
      @blur="onBlur"
      @keyup.enter="onEnter"
      @keyup.esc="isEditing = false"
    />
    <button
      v-else
      :class="[
        'flex cursor-pointer items-center whitespace-nowrap px-2 w-full',
        { 'bg-blue-200 hover:bg-blue-100': isActive },
      ]"
      :style="buttonStyle"
      @contextmenu="handleFileContextMenu"
      @click="emit('click', file.id)"
    >
      <span>{{ file.name }}</span>
    </button>
  </div>
</template>
