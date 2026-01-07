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
      t15.value as inactiveFolderBackground,
      t16.value as tabChangedIndicator,
      t17.value as activeTabText,
      t18.value as inactiveTabText,
      t19.value as activeFileHoverBackground,
      t20.value as activeFolderHoverBackground,
      t21.value as inactiveFileHoverBackground,
      t22.value as inactiveFolderHoverBackground,
      t23.value as activeFileHoverText,
      t24.value as activeFolderHoverText,
      t25.value as inactiveFileHoverText,
      t26.value as inactiveFolderHoverText
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
    left outer join theme_entry t15 on t15.key = 'inactiveFolderBackground'
    left outer join theme_entry t16 on t16.key = 'tabChangedIndicator'
    left outer join theme_entry t17 on t17.key = 'activeTabText'
    left outer join theme_entry t18 on t18.key = 'inactiveTabText'
    left outer join theme_entry t19 on t19.key = 'activeFileHoverBackground'
    left outer join theme_entry t20 on t20.key = 'activeFolderHoverBackground'
    left outer join theme_entry t21 on t21.key = 'inactiveFileHoverBackground'
    left outer join theme_entry t22 on t22.key = 'inactiveFolderHoverBackground'
    left outer join theme_entry t23 on t23.key = 'activeFileHoverText'
    left outer join theme_entry t24 on t24.key = 'activeFolderHoverText'
    left outer join theme_entry t25 on t25.key = 'inactiveFileHoverText'
    left outer join theme_entry t26 on t26.key = 'inactiveFolderHoverText';
  `)
  )[0]
}
