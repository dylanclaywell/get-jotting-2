<script lang="ts" setup>
import iro from '@jaames/iro'
import { onMounted, onUnmounted, ref, watch } from 'vue'

type Props = {
  id: string
}

const props = defineProps<Props>()

const colorPicker = ref()

const value = defineModel<string>({
  set: (val) => {
    console.log('val', val)
    return val
  },
})

function onInputChange(color: any) {
  value.value = color.hexString
}

onMounted(() => {
  colorPicker.value = new (iro.ColorPicker as any)(`#${props.id}`, {
    // Set the size of the color picker
    width: 320,
    // Set the initial color to pure red
    color: value.value ?? '#fff',
  })

  colorPicker.value.on('input:change', onInputChange)
})

onUnmounted(() => {
  colorPicker.value.off('input:change', onInputChange)
})

watch(value, (newColor) => {
  const hexRegex = /^#([0-9A-Fa-f]{3}){1,2}$/i

  if (
    colorPicker.value &&
    newColor &&
    newColor !== colorPicker.value.color.hexString &&
    hexRegex.test(newColor)
  ) {
    colorPicker.value.color.hexString = newColor
  }
})
</script>

<template>
  <div :id="id"></div>
</template>
