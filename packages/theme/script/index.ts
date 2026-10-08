import { fetchColorXlsx } from './fetch'
import { translateColorXlsx } from './translate'

/** `pnpm theme -- -local` 读 xlsx.local，不走 branch；`-fetch` 仍远程克隆 */
const shouldLocal = process.argv.includes('-local')
const shouldFetch = process.argv.includes('-fetch')

const run = async () => {
	if (shouldLocal) await fetchColorXlsx('local')
	else if (shouldFetch) await fetchColorXlsx('git')
	await translateColorXlsx()
}

run().catch((err) => {
	console.error('theme 脚本执行失败:', err)
	process.exit(1)
})
