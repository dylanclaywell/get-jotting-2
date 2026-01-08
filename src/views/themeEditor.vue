<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import {
  BaseDirectory,
  readDir,
  readTextFile,
  writeTextFile,
} from '@tauri-apps/plugin-fs'
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow'

import themeEditorColorPicker from '../components/themeEditorColorPicker.vue'
import themeEditorOption from '../components/themeEditorOption.vue'
import { Theme, themeOptionMapping, themeSchema } from '../validation/theme'
import db from '../services/db'
import { getCurrentTheme } from '../services/theme'
import { Nullish } from '../types/nullish'
import { buildTheme } from '../utils/buildTheme'
import { ChevronDown } from 'lucide-vue-next'
import { emitTo } from '@tauri-apps/api/event'

const activeButton = ref('activeTab')
const presetName = ref('')

const selectRef = ref<HTMLSelectElement | null>(null)

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

  await emitTo('main', 'theme-updated')

  currentWindow.close()
}

async function onSaveAsNewPreset() {
  if (!presetName.value) return

  const filename = `${presetName.value}.json`
  const themeData = JSON.stringify(editingTheme.value, null, 2)
  await writeTextFile(`themes/${filename}`, themeData, {
    baseDir: BaseDirectory.AppLocalData,
  })

  await loadThemes()
  selectedTheme.value = filename
}

function onThemeSelectClick(event: MouseEvent) {
  if (selectRef.value && event.target !== selectRef.value) {
    selectRef.value.click()
  }
}

onMounted(async () => {
  await loadThemes()
  const currentTheme = await getCurrentTheme()
  copyThemeSettingsToEditingTheme(currentTheme)
})
</script>

<template>
  <div class="flex flex-col h-screen overflow-hidden">
    <div class="flex border-b p-2">
      <div class="relative" @click="onThemeSelectClick">
        <select
          ref="selectRef"
          v-model="selectedTheme"
          class="border rounded px-2 pr-6 py-1 appearance-none"
        >
          <option
            v-for="theme in themes"
            :key="theme.filename"
            :value="theme.filename"
          >
            {{ theme.name }}
          </option>
        </select>

        <ChevronDown class="absolute right-2 top-1.5 w-4 pointer-events-none" />
      </div>

      <button
        class="ml-2 cursor-pointer border-2 border-blue-200 hover:bg-blue-100 px-2 py-0 rounded-sm"
        @click="applyTheme"
      >
        Apply
      </button>
    </div>
    <div class="flex h-full">
      <div
        class="flex flex-col items-start border-r overflow-y-auto h-[calc(100vh-7.5rem)]"
      >
        <div v-for="key in Object.keys(editingTheme)" :key="key" class="w-full">
          <theme-editor-option
            :text="themeOptionMapping[key as keyof Theme] ?? key"
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
    <div class="border-t flex justify-between items-center p-4">
      <div class="flex items-center gap-2">
        <input class="border rounded-sm" v-model="presetName" />
        <button
          class="hover:bg-blue-100 px-4 py-2 rounded-sm"
          @click="onSaveAsNewPreset"
        >
          Save as New Preset
        </button>
      </div>
      <div class="flex justify-end gap-4">
        <button
          class="hover:bg-blue-100 px-4 py-2 rounded-sm"
          @click="onCancel"
        >
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
  </div>
</template>
