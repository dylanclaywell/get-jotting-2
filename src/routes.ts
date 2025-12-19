import { RouteRecordRaw } from 'vue-router'

import main from './views/main.vue'
import themeEditor from './views/themeEditor.vue'
import { RouteNames } from './enums/routeNames'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: main,
    name: RouteNames.main,
  },
  {
    path: '/theme-editor',
    component: themeEditor,
    name: RouteNames.themeEditor,
  },
]
