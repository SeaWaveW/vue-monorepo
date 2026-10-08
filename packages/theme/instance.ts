import type { ThemeColors } from './module/types'
import { themeColors } from './setup'
import { createVueTheme } from '@saco/theme/vue'
import '../style/theme/index.scss'

type ThemeColorMap = ThemeColors & Record<string, string>

export const { themePlugin, useTheme } = createVueTheme<ThemeColorMap>({
	colors: themeColors,
})
