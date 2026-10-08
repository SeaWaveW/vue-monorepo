import { marked } from 'marked'
import DOMPurify from 'dompurify'

/**
 * Markdown → 安全 HTML。
 * 先 marked（async:false 才是字符串），再 DOMPurify，直接 v-html 会 XSS。
 */
export const renderMarkdown = (source?: string) => {
	if (!source) {
		return ''
	}
	const html = marked.parse(source, {
		async: false,
	})
	return DOMPurify.sanitize(html)
}
