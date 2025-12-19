<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { BaseDirectory, readDir, readTextFile } from '@tauri-apps/plugin-fs'
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow'

import themeEditorColorPicker from '../components/themeEditorColorPicker.vue'
import themeEditorOption from '../components/themeEditorOption.vue'
import { Theme, themeSchema } from '../validation/theme'
import db from '../services/db'
import { getCurrentTheme } from '../services/theme'
import { Nullish } from '../types/nullish'
import { buildTheme } from '../utils/buildTheme'

const activeButton = ref('activeTab')

const editingTheme = ref<Theme>(buildTheme({}))

const themes = ref<Array<{ name: string; filename: string }>>([])

const selectedTheme = ref<string>('default.json')

function isActive(button: string) {
  return activeButton.value === button
}

function setButton(button: string) {
  activeButton.value = button
}

async function loadThemes() {
  const files = await readDir('themes', {
    baseDir: BaseDirectory.AppLocalData,
  })

  themes.value = files
    .filter((file) => file.name && file.name.endsWith('.json'))
    .map((file) => ({
      name: file.name!.replace('.json', ''),
      filename: file.name!,
    }))
}

function copyThemeSettingsToEditingTheme(theme: Nullish<Theme>) {
  editingTheme.value = buildTheme(theme)
}

async function applyTheme() {
  console.log('Applying theme:', selectedTheme.value)
  if (!selectedTheme.value) return

  const file = await readTextFile(`themes/${selectedTheme.value}`, {
    baseDir: BaseDirectory.AppLocalData,
  })

  const result = themeSchema.safeParse(JSON.parse(file))

  if (result.success) {
    const theme = result.data
    copyThemeSettingsToEditingTheme(theme)
  } else {
    console.error('Invalid theme file:', result.error)
  }
}

function onCancel() {
  const currentWindow = getCurrentWebviewWindow()

  currentWindow.close()
}

async function onSave() {
  const currentWindow = getCurrentWebviewWindow()
  const currentTheme = await getCurrentTheme()

  for (const key of Object.keys(editingTheme.value)) {
    if (currentTheme[key as keyof typeof currentTheme]) {
      await db.execute(`update theme_entry set value = ? where key = ?;`, [
        editingTheme.value[key as keyof typeof editingTheme.value],
        key,
      ])
    } else {
      await db.execute(`insert into theme_entry (key, value) values (?, ?);`, [
        key,
        editingTheme.value[key as keyof typeof editingTheme.value],
      ])
    }
  }

  currentWindow.close()
}

onMounted(async () => {
  await loadThemes()
  const currentTheme = await getCurrentTheme()
  copyThemeSettingsToEditingTheme(currentTheme)
})
</script>

<template>
  <div class="flex flex-col h-screen overflow-hidden">
    <div class="flex border-b">
      <select v-model="selectedTheme">
        <option
          v-for="theme in themes"
          :key="theme.filename"
          :value="theme.filename"
        >
          {{ theme.name }}
        </option>
      </select>

      <button class="cursor-pointer" @click="applyTheme">Apply</button>
    </div>
    <div class="flex h-full">
      <div
        class="flex flex-col items-start border-r overflow-y-auto h-[calc(100vh-6rem)]"
      >
        <div v-for="key in Object.keys(editingTheme)" :key="key" class="w-full">
          <theme-editor-option
            :text="key"
            :isActive="isActive(key)"
            :optionKey="key"
            @click="setButton(key)"
          />
        </div>
      </div>
      <div class="flex flex-col items-center flex-1 p-4">
        <div v-for="key in Object.keys(editingTheme)">
          <theme-editor-color-picker
            v-if="isActive(key)"
            v-model="editingTheme[key as keyof Theme]"
          />
        </div>
      </div>
    </div>
    <div class="border-t flex justify-end gap-4 p-4">
      <button class="hover:bg-blue-100 px-4 py-2 rounded-sm" @click="onCancel">
        Cancel
      </button>
      <button
        class="bg-blue-200 hover:bg-blue-100 px-4 py-2 rounded-sm"
        @click="onSave"
      >
        Save
      </button>
    </div>
  </div>
</template>
