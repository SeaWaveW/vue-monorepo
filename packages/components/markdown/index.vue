<template>
	<!-- eslint-disable vue/no-v-html -- marked 后再 DOMPurify -->
	<div v-if="html" class="markdown" v-html="html" />
	<!-- eslint-enable vue/no-v-html -->
	<template v-else>
		{{ leachFormatter(source) }}
	</template>
</template>
<script lang="ts" setup name="CommonMarkdown">
import { computed } from 'vue'
import { leachFormatter } from '../../utils/formatter'
import { renderMarkdown } from '../../utils/markdown'

const props = defineProps({
	source: {
		type: String,
		default: '',
	},
})
const html = computed(() => renderMarkdown(props.source))
</script>
<style scoped lang="scss">
.markdown {
	font-size: var(--font-size);
	line-height: 1.8;
	color: var(--black-color-1);
	word-break: break-all;

	:deep(h1),
	:deep(h2),
	:deep(h3),
	:deep(h4),
	:deep(h5),
	:deep(h6) {
		margin: 0 0 0.6em;
		font-weight: var(--font-bold);
		color: var(--black-color);
	}

	:deep(p) {
		margin: 0 0 0.6em;
	}

	:deep(ul),
	:deep(ol) {
		padding-left: 1.4em;
		margin: 0 0 0.6em;
	}

	:deep(li) {
		margin-bottom: 0.2em;

		&::marker {
			color: var(--primary-color);
		}
	}

	:deep(code) {
		padding: 0 0.3em;
		font-size: 0.9em;
		background-color: var(--grey-color-20);
		border-radius: 4px;
	}

	:deep(strong) {
		font-weight: var(--font-bold);
	}

	:deep(a) {
		color: var(--primary-color);
	}

	:deep(blockquote) {
		padding-left: 0.8em;
		margin: 0 0 0.6em;
		color: var(--grey-color-18);
		border-left: 3px solid var(--grey-color-11);
	}

	:deep(pre) {
		padding: 0.8em 1em;
		margin: 0 0 0.6em;
		overflow: auto;
		background-color: var(--grey-color-20);
		border-radius: 4px;

		code {
			padding: 0;
			background-color: transparent;
		}
	}

	:deep(table) {
		width: 100%;
		margin: 0 0 0.6em;
		border-collapse: collapse;
	}

	:deep(th),
	:deep(td) {
		padding: 0.4em 0.6em;
		border: 1px solid var(--grey-color-11);
	}

	:deep(hr) {
		margin: 0.8em 0;
		border: 0;
		border-top: 1px solid var(--grey-color-11);
	}
}
</style>
