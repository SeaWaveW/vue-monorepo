import path from 'node:path'
import { fetchGitXlsx, xlsxRootDir, type XlsxSource } from '../../../build/git-fetch'

const destPath = path.join(xlsxRootDir, 'src/i18n/language.xlsx')

/** 从远程仓或 xlsx.local 拷贝 language.xlsx */
export const fetchLanguageXlsx = async (source: XlsxSource = 'git') => {
	fetchGitXlsx('i18n', destPath, source)
}
