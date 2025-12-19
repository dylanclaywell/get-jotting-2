<script lang="ts" setup>
import colorPicker from './colorPicker/colorPicker.vue'

const value = defineModel<string>()
</script>

<template>
  <color-picker v-model="value" />
  <label>
    Color:&nbsp;
    <input
      class="mt-4 border rounded-sm"
      placeholder="Hex, rgb"
      v-model="value"
    />
  </label>
</template>
