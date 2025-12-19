<script lang="ts" setup>
import { ref } from 'vue'

import { generateId } from '../../utils/uuid'
import colorPickerBase from './colorPickerBase.vue'

const id = ref(`color-picker-${generateId()}`)

const value = defineModel<string>()
</script>

<template>
  <color-picker-base :id="id" v-model="value" />
</template>
