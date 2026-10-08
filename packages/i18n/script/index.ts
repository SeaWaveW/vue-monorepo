import { fetchLanguageXlsx } from './fetch'
import { translateLanguageXlsx } from './translate'

/** `pnpm i18n -- -local` 读 xlsx.local，不走 branch；`-fetch` 仍远程克隆 */
const shouldLocal = process.argv.includes('-local')
const shouldFetch = process.argv.includes('-fetch')

const run = async () => {
	if (shouldLocal) await fetchLanguageXlsx('local')
	else if (shouldFetch) await fetchLanguageXlsx('git')
	await translateLanguageXlsx()
}

run().catch((err) => {
	console.error('i18n 脚本执行失败:', err)
	process.exit(1)
})
