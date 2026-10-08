<template>
	<div class="configure-upload">
		<SacoFormItem :label="t('file_format')">
			<SacoSelect
				v-model="propsModel.accept"
				:clearable="false"
				:placeholder="t('validate_please_select')"
				:data="suffixOptions"
				:multiple="true"
				:filterable="true"
			></SacoSelect>
		</SacoFormItem>
	</div>
</template>
<script lang="ts" setup name="ConfigureUpload">
import type { ComponentItem } from '#/dynamic'
import { IMAGE_UPLOAD_ACCEPT } from '#/dynamic/upload/image'
import { fileSuffixList } from '#/utils/file'
import { usePropsModel } from '../config'
const component = defineModel<ComponentItem | null>('component')
const { t } = useI18n()
const propsModel = usePropsModel(component)
const usableList = fileSuffixList.filter((item) => item.usable)
/** 图片上传只给图片后缀，避免配置面板选出 pdf / docx */
const suffixOptions = computed(() => {
	if (component.value?.name === 'DynamicUploadImage') {
		return usableList.filter((item) =>
			IMAGE_UPLOAD_ACCEPT.includes(item.value),
		)
	}
	return usableList
})
</script>
<style scoped lang="scss">
.configure-upload {
	width: 100%;
}
</style>
