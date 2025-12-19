<script lang="ts" setup>
type Props = {
  isActive: boolean
  text: string
  optionKey: string
}

type Emits = {
  click: [key: string]
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<template>
  <button
    class="p-2 w-full text-start cursor-pointer"
    :class="{
      'bg-blue-200 hover:bg-blue-100': isActive,
    }"
    @click="$emit('click', optionKey)"
  >
    {{ text }}
  </button>
</template>
