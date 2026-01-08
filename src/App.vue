<script setup lang="ts">
import { onMounted } from 'vue'
import {
  Menu,
  MenuItem,
  Submenu,
  PredefinedMenuItem,
} from '@tauri-apps/api/menu'
import { platform } from '@tauri-apps/plugin-os'
import { RouterView, useRoute, useRouter } from 'vue-router'

import {
  getCurrentWebviewWindow,
  WebviewWindow,
} from '@tauri-apps/api/webviewWindow'
import { RouteNames } from './enums/routeNames'

const route = useRoute()
const router = useRouter()

async function setUpAppMenu() {
  const currentWindow = getCurrentWebviewWindow()

  console.log('Current route name:', route.name)

  const fileSubmenu = await Submenu.new({
    id: 'file-submenu',
    text: 'File',
    items: [
      await MenuItem.new({
        id: 'file-submenu-new-file',
        text: 'New File',
      }),
    ],
  })

  const editSubmenu = await Submenu.new({
    id: 'edit-submenu',
    text: 'Edit',
    items: [
      await PredefinedMenuItem.new({
        item: 'SelectAll',
      }),
      await PredefinedMenuItem.new({
        item: 'Undo',
      }),
      await PredefinedMenuItem.new({
        item: 'Redo',
      }),
      await PredefinedMenuItem.new({
        item: 'Cut',
      }),
      await PredefinedMenuItem.new({
        item: 'Copy',
      }),
      await PredefinedMenuItem.new({
        item: 'Paste',
      }),
    ],
  })

  const settingsSubmenu = await Submenu.new({
    id: 'settings-submenu',
    text: 'Settings',
    items: [
      await MenuItem.new({
        id: 'settings-submenu-theme-editor',
        text: 'Theme Editor',
        action: async () => {
          new WebviewWindow('theme-editor', {
            url: 'theme-editor',
            title: 'Theme Editor',
            width: 800,
            height: 600,
            maximized: true,
          })
        },
      }),
    ],
  })

  const appMenu = await Menu.new({
    id: 'app-menu',
    items: [fileSubmenu, editSubmenu, settingsSubmenu],
  })

  const os = await platform()

  // MacOS uses a global menu for the app, while other OSes use window-specific menus
  if (os === 'macos') {
    appMenu.setAsAppMenu()
  } else {
    appMenu.setAsWindowMenu(currentWindow)
  }
}

onMounted(async () => {
  await router.isReady()

  if (route.name === RouteNames.main) {
    await setUpAppMenu()
  }
})
</script>

<template>
  <router-view> </router-view>
</template>

<style scoped>
.activeTab {
  box-shadow: inset 0 3px 0 0 var(--color-pink-500);
}
</style>
