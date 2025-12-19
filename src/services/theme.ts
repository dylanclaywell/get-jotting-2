import { Nullish } from '../types/nullish'
import { Theme } from '../validation/theme'
import db from './db'

export async function getCurrentTheme() {
  return (
    await db.select<Nullish<Theme>[]>(`
    select distinct
      t1.value as background,
      t2.value as editorBackground,
      t3.value as activeTabBackground,
      t4.value as activeTabHighlight,
      t5.value as inactiveTabBackground,
      t6.value as editorText,
      t7.value as fileTreeBackground,
      t8.value as activeFileText,
      t9.value as activeFileBackground,
      t10.value as activeFolderText,
      t11.value as activeFolderBackground,
      t12.value as inactiveFileText,
      t13.value as inactiveFileBackground,
      t14.value as inactiveFolderText,
      t15.value as inactiveFolderBackground
    from theme_entry t0
    left outer join theme_entry t1 on t1.key = 'background'
    left outer join theme_entry t2 on t2.key = 'editorBackground'
    left outer join theme_entry t3 on t3.key = 'activeTabBackground'
    left outer join theme_entry t4 on t4.key = 'activeTabHighlight'
    left outer join theme_entry t5 on t5.key = 'inactiveTabBackground'
    left outer join theme_entry t6 on t6.key = 'editorText'
    left outer join theme_entry t7 on t7.key = 'fileTreeBackground'
    left outer join theme_entry t8 on t8.key = 'activeFileText'
    left outer join theme_entry t9 on t9.key = 'activeFileBackground'
    left outer join theme_entry t10 on t10.key = 'activeFolderText'
    left outer join theme_entry t11 on t11.key = 'activeFolderBackground'
    left outer join theme_entry t12 on t12.key = 'inactiveFileText'
    left outer join theme_entry t13 on t13.key = 'inactiveFileBackground'
    left outer join theme_entry t14 on t14.key = 'inactiveFolderText'
    left outer join theme_entry t15 on t15.key = 'inactiveFolderBackground';
  `)
  )[0]
}
