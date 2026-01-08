<script lang="ts" setup>
import { ChevronRight } from 'lucide-vue-next'
import { Theme } from '../validation/theme'

type Props = {
  theme: Theme
}

defineProps<Props>()
</script>

<template>
  <div class="w-100 h-80 rounded-md flex shadow-2xl">
    <div
      class="w-40 h-full rounded-l-md pt-10"
      :style="{ backgroundColor: theme.fileTreeBackground }"
    >
      <div
        class="h-4 flex items-center pl-2"
        :style="{
          backgroundColor: theme.activeFileBackground,
        }"
      >
        <div
          class="w-8 h-1 rounded-full"
          :style="{ backgroundColor: theme.activeFileText }"
        ></div>
      </div>
      <div
        class="h-4 flex items-center pl-2"
        :style="{ backgroundColor: theme.inactiveFileBackground }"
      >
        <div
          class="w-12 h-1 rounded-full"
          :style="{ backgroundColor: theme.inactiveFileText }"
        ></div>
      </div>
      <div
        class="h-4 flex items-center pl-1"
        :style="{ backgroundColor: theme.activeFolderBackground }"
      >
        <ChevronRight
          class="w-3 h-3"
          :style="{ color: theme.activeFolderText }"
        />
        <div
          class="w-12 h-1 rounded-full"
          :style="{ backgroundColor: theme.activeFolderText }"
        ></div>
      </div>
      <div
        class="h-4 flex items-center pl-1"
        :style="{ backgroundColor: theme.inactiveFolderBackground }"
      >
        <ChevronRight
          class="w-3 h-3"
          :style="{ color: theme.inactiveFolderText }"
        />
        <div
          class="w-12 h-1 rounded-full"
          :style="{ backgroundColor: theme.inactiveFolderText }"
        ></div>
      </div>
    </div>
    <div class="w-full h-[calc(100%-2.5rem)] rounded-r-md">
      <div
        class="w-full h-10 flex-col flex justify-end rounded-tr-md"
        :style="{ backgroundColor: theme.background }"
      >
        <div class="ml-2 flex">
          <div
            class="w-16 h-8 flex flex-col items-center justify-center"
            :style="{
              backgroundColor: theme.activeTabBackground,
              boxShadow: `inset 0 3px 0 0 ${theme.activeTabHighlight}`,
            }"
          >
            <div
              class="w-8 h-1 rounded-full"
              :style="{
                backgroundColor: theme.activeTabText,
              }"
            ></div>
            <div
              class="w-8 h-0.5 mt-1"
              :style="{
                backgroundColor: theme.tabChangedIndicator,
              }"
            ></div>
          </div>
          <div
            class="w-16 h-8 flex items-center justify-center"
            :style="{ backgroundColor: theme.inactiveTabBackground }"
          >
            <div
              class="w-12 h-1 rounded-full"
              :style="{ backgroundColor: theme.inactiveTabText }"
            ></div>
          </div>
        </div>
      </div>
      <div
        class="w-full h-full rounded-br-md p-2 flex flex-col gap-2"
        :style="{ backgroundColor: theme.editorBackground }"
      >
        <div class="flex gap-2">
          <div
            class="w-6 h-1 rounded-full"
            :style="{ backgroundColor: theme.editorText }"
          ></div>
          <div
            class="w-14 h-1 rounded-full"
            :style="{ backgroundColor: theme.editorText }"
          ></div>
        </div>
        <div class="flex gap-2">
          <div
            class="w-12 h-1 rounded-full"
            :style="{ backgroundColor: theme.editorText }"
          ></div>
          <div
            class="w-10 h-1 rounded-full"
            :style="{ backgroundColor: theme.editorText }"
          ></div>
        </div>
        <div class="flex gap-2">
          <div
            class="w-6 h-1 rounded-full"
            :style="{ backgroundColor: theme.editorText }"
          ></div>
          <div
            class="w-14 h-1 rounded-full"
            :style="{ backgroundColor: theme.editorText }"
          ></div>
        </div>
        <div class="flex gap-2">
          <div
            class="w-14 h-1 rounded-full"
            :style="{ backgroundColor: theme.editorText }"
          ></div>
          <div
            class="w-2 h-1 rounded-full"
            :style="{ backgroundColor: theme.editorText }"
          ></div>
        </div>
        <div class="flex gap-2">
          <div
            class="w-6 h-1 rounded-full"
            :style="{ backgroundColor: theme.editorText }"
          ></div>
          <div
            class="w-14 h-1 rounded-full"
            :style="{ backgroundColor: theme.editorText }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>
