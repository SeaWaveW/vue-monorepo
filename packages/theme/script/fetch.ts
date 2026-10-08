import path from 'node:path'
import { fetchGitXlsx, xlsxRootDir, type XlsxSource } from '../../../build/git-fetch'

const destPath = path.join(xlsxRootDir, 'src/theme/color.xlsx')

/** 从远程仓或 xlsx.local 拷贝 variable.xlsx，覆盖本地 color.xlsx */
export const fetchColorXlsx = async (source: XlsxSource = 'git') => {
	fetchGitXlsx('theme', destPath, source)
}
