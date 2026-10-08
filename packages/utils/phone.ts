/**
 * 手机号：前端拆区号展示，接口 `phone` 仍是一段数字 `86****`（无 +）。
 * 解析按从长到短匹配区号；11 位大陆号没写 86 的旧数据仍当 +86。
 */
import type { SvgName } from '@saco/ui'

/** 区号（数字、无 +）。解析按长度从长到短，避免 852 被拆成 85 */
export const PHONE_DIAL_CODES = [
	'1',
	'7',
	'20',
	'27',
	'30',
	'31',
	'32',
	'33',
	'34',
	'36',
	'39',
	'40',
	'41',
	'43',
	'44',
	'45',
	'46',
	'47',
	'48',
	'49',
	'51',
	'52',
	'53',
	'54',
	'55',
	'56',
	'57',
	'58',
	'60',
	'61',
	'62',
	'63',
	'64',
	'65',
	'66',
	'81',
	'82',
	'84',
	'86',
	'90',
	'91',
	'92',
	'93',
	'94',
	'95',
	'98',
	'211',
	'212',
	'213',
	'216',
	'218',
	'220',
	'221',
	'222',
	'223',
	'224',
	'225',
	'226',
	'227',
	'228',
	'229',
	'230',
	'231',
	'232',
	'233',
	'234',
	'235',
	'236',
	'237',
	'238',
	'239',
	'240',
	'241',
	'242',
	'243',
	'244',
	'245',
	'246',
	'248',
	'249',
	'250',
	'251',
	'252',
	'253',
	'254',
	'255',
	'256',
	'257',
	'258',
	'260',
	'261',
	'262',
	'263',
	'264',
	'265',
	'266',
	'267',
	'268',
	'269',
	'290',
	'291',
	'297',
	'298',
	'299',
	'350',
	'351',
	'352',
	'353',
	'354',
	'355',
	'356',
	'357',
	'358',
	'359',
	'370',
	'371',
	'372',
	'373',
	'374',
	'375',
	'376',
	'377',
	'378',
	'380',
	'381',
	'382',
	'383',
	'385',
	'386',
	'387',
	'389',
	'420',
	'421',
	'423',
	'500',
	'501',
	'502',
	'503',
	'504',
	'505',
	'506',
	'507',
	'508',
	'509',
	'590',
	'591',
	'592',
	'593',
	'594',
	'595',
	'596',
	'597',
	'598',
	'599',
	'670',
	'672',
	'673',
	'674',
	'675',
	'676',
	'677',
	'678',
	'679',
	'680',
	'681',
	'682',
	'683',
	'685',
	'686',
	'687',
	'688',
	'689',
	'690',
	'691',
	'692',
	'850',
	'852',
	'853',
	'855',
	'856',
	'880',
	'886',
	'960',
	'961',
	'962',
	'963',
	'964',
	'965',
	'966',
	'967',
	'968',
	'970',
	'971',
	'972',
	'973',
	'974',
	'975',
	'976',
	'977',
	'992',
	'993',
	'994',
	'995',
	'996',
	'998',
] as const

/** 大陆区号。旧数据 11 位手机、校验大陆号、中文界面默认用这个 */
const CHINA_COUNTRY_CODE = '86'

/** 英文界面默认美国 +1 */
const US_COUNTRY_CODE = '1'

/**
 * 新建页国家呼叫代码默认值。中文 86，其它语言 1。
 * 空 language 按非中文，避免再写死 86。
 */
export const getDefaultPhoneCountryCode = (language?: string) => {
	if (language === 'chinese') {
		return CHINA_COUNTRY_CODE
	}
	return US_COUNTRY_CODE
}

/**
 * 区号 → ISO 3166-1 alpha-2。共享号取常用代表国（+1 美国、+7 俄罗斯）。
 * 文件在 `packages/assets/svg/country/{iso}.svg`；插件不递归子目录，业务要另扫这一层，SacoSvg 名就是 iso。
 */
export const PHONE_DIAL_ISO: Record<string, string> = {
	'1': 'us',
	'7': 'ru',
	'20': 'eg',
	'27': 'za',
	'30': 'gr',
	'31': 'nl',
	'32': 'be',
	'33': 'fr',
	'34': 'es',
	'36': 'hu',
	'39': 'it',
	'40': 'ro',
	'41': 'ch',
	'43': 'at',
	'44': 'gb',
	'45': 'dk',
	'46': 'se',
	'47': 'no',
	'48': 'pl',
	'49': 'de',
	'51': 'pe',
	'52': 'mx',
	'53': 'cu',
	'54': 'ar',
	'55': 'br',
	'56': 'cl',
	'57': 'co',
	'58': 've',
	'60': 'my',
	'61': 'au',
	'62': 'id',
	'63': 'ph',
	'64': 'nz',
	'65': 'sg',
	'66': 'th',
	'81': 'jp',
	'82': 'kr',
	'84': 'vn',
	'86': 'cn',
	'90': 'tr',
	'91': 'in',
	'92': 'pk',
	'93': 'af',
	'94': 'lk',
	'95': 'mm',
	'98': 'ir',
	'211': 'ss',
	'212': 'ma',
	'213': 'dz',
	'216': 'tn',
	'218': 'ly',
	'220': 'gm',
	'221': 'sn',
	'222': 'mr',
	'223': 'ml',
	'224': 'gn',
	'225': 'ci',
	'226': 'bf',
	'227': 'ne',
	'228': 'tg',
	'229': 'bj',
	'230': 'mu',
	'231': 'lr',
	'232': 'sl',
	'233': 'gh',
	'234': 'ng',
	'235': 'td',
	'236': 'cf',
	'237': 'cm',
	'238': 'cv',
	'239': 'st',
	'240': 'gq',
	'241': 'ga',
	'242': 'cg',
	'243': 'cd',
	'244': 'ao',
	'245': 'gw',
	'246': 'io',
	'248': 'sc',
	'249': 'sd',
	'250': 'rw',
	'251': 'et',
	'252': 'so',
	'253': 'dj',
	'254': 'ke',
	'255': 'tz',
	'256': 'ug',
	'257': 'bi',
	'258': 'mz',
	'260': 'zm',
	'261': 'mg',
	'262': 'yt',
	'263': 'zw',
	'264': 'na',
	'265': 'mw',
	'266': 'ls',
	'267': 'bw',
	'268': 'sz',
	'269': 'km',
	'290': 'sh',
	'291': 'er',
	'297': 'aw',
	'298': 'fo',
	'299': 'gl',
	'350': 'gi',
	'351': 'pt',
	'352': 'lu',
	'353': 'ie',
	'354': 'is',
	'355': 'al',
	'356': 'mt',
	'357': 'cy',
	'358': 'fi',
	'359': 'bg',
	'370': 'lt',
	'371': 'lv',
	'372': 'ee',
	'373': 'md',
	'374': 'am',
	'375': 'by',
	'376': 'ad',
	'377': 'mc',
	'378': 'sm',
	'380': 'ua',
	'381': 'rs',
	'382': 'me',
	'383': 'xk',
	'385': 'hr',
	'386': 'si',
	'387': 'ba',
	'389': 'mk',
	'420': 'cz',
	'421': 'sk',
	'423': 'li',
	'500': 'fk',
	'501': 'bz',
	'502': 'gt',
	'503': 'sv',
	'504': 'hn',
	'505': 'ni',
	'506': 'cr',
	'507': 'pa',
	'508': 'pm',
	'509': 'ht',
	'590': 'gp',
	'591': 'bo',
	'592': 'gy',
	'593': 'ec',
	'594': 'gf',
	'595': 'py',
	'596': 'mq',
	'597': 'sr',
	'598': 'uy',
	'599': 'cw',
	'670': 'tl',
	'672': 'nf',
	'673': 'bn',
	'674': 'nr',
	'675': 'pg',
	'676': 'to',
	'677': 'sb',
	'678': 'vu',
	'679': 'fj',
	'680': 'pw',
	'681': 'wf',
	'682': 'ck',
	'683': 'nu',
	'685': 'ws',
	'686': 'ki',
	'687': 'nc',
	'688': 'tv',
	'689': 'pf',
	'690': 'tk',
	'691': 'fm',
	'692': 'mh',
	'850': 'kp',
	'852': 'hk',
	'853': 'mo',
	'855': 'kh',
	'856': 'la',
	'880': 'bd',
	'886': 'tw',
	'960': 'mv',
	'961': 'lb',
	'962': 'jo',
	'963': 'sy',
	'964': 'iq',
	'965': 'kw',
	'966': 'sa',
	'967': 'ye',
	'968': 'om',
	'970': 'ps',
	'971': 'ae',
	'972': 'il',
	'973': 'bh',
	'974': 'qa',
	'975': 'bt',
	'976': 'mn',
	'977': 'np',
	'992': 'tj',
	'993': 'tm',
	'994': 'az',
	'995': 'ge',
	'996': 'kg',
	'998': 'uz',
}

/** `country/cn.svg` 扫出来的 SacoSvg 名就是 `cn` */
export const phoneDialSvgName = (countryCode: string): SvgName | '' => {
	const iso = PHONE_DIAL_ISO[countryCode]
	if (!iso) {
		return ''
	}
	// Extra 已登记 country/{iso}.svg，Record 取值仍是 string
	return iso as SvgName
}

/** 拆开后的展示字段；提交前再 `composePhone` 拼回接口 */
export interface PhoneParts {
	countryCode: string
	localNumber: string
}

export interface PhoneDialOption {
	label: string
	value: string
	/** 对应 `packages/assets/svg/country/{iso}.svg`；空则不画旗 */
	svgName: SvgName | ''
}

const DIAL_CODE_SET = new Set<string>(PHONE_DIAL_CODES)

/** 从长到短，避免 852 先被 85 / 8 吃掉 */
const DIAL_CODES_BY_LENGTH = [...PHONE_DIAL_CODES].sort(
	(left, right) => right.length - left.length,
)

/**
 * 下拉选项。按区号数字排，方便搜 +852。不要预置默认国家。
 */
const toDialOption = (code: string): PhoneDialOption => ({
	label: `+${code}`,
	value: code,
	svgName: phoneDialSvgName(code),
})

export const PHONE_DIAL_OPTIONS: PhoneDialOption[] = [...PHONE_DIAL_CODES]
	.sort((left, right) => Number(left) - Number(right))
	.map(toDialOption)

/**
 * 只留数字。`+` / `00` / 空格括号横线都剥掉，才能跟接口 `86****` 对齐。
 */
export const compactPhone = (value: unknown): string => {
	const raw = String(value ?? '')
		.trim()
		.replace(/[\s\-().]/g, '')
	const withoutPlus = raw.startsWith('+')
		? raw.slice(1)
		: raw.startsWith('00')
			? raw.slice(2)
			: raw
	return withoutPlus.replace(/\D/g, '')
}

/**
 * 接口 `phone` → 区号 + 本地号。空串不预选国家；11 位大陆旧数据仍是 86。
 */
export const parsePhone = (value: unknown): PhoneParts => {
	const digits = compactPhone(value)
	if (!digits) {
		return {
			countryCode: '',
			localNumber: '',
		}
	}
	// 情况1：旧数据只存了 11 位大陆手机，没有 86；不能先按 +1 拆
	if (/^1[3-9]\d{9}$/.test(digits)) {
		return {
			countryCode: CHINA_COUNTRY_CODE,
			localNumber: digits,
		}
	}
	// 情况2：整段刚好是区号（只选了前缀、本地号还空）
	if (DIAL_CODE_SET.has(digits)) {
		return {
			countryCode: digits,
			localNumber: '',
		}
	}
	// 情况3：本产品默认大陆，86 优先于更短的 8
	if (
		digits.startsWith(CHINA_COUNTRY_CODE) &&
		digits.length > CHINA_COUNTRY_CODE.length
	) {
		return {
			countryCode: CHINA_COUNTRY_CODE,
			localNumber: digits.slice(CHINA_COUNTRY_CODE.length),
		}
	}
	for (const code of DIAL_CODES_BY_LENGTH) {
		if (digits.startsWith(code) && digits.length > code.length) {
			return {
				countryCode: code,
				localNumber: digits.slice(code.length),
			}
		}
	}
	// 情况4：对不上区号，不预选国家，本地号先原样放下
	return {
		countryCode: '',
		localNumber: digits,
	}
}

/**
 * 区号 + 本地号 → 接口 `phone`。本地号空则回空串，不要只交 `86`。
 * @param maxLength 接口字段上限；超出只截本地号，区号不动
 */
export const composePhone = (
	countryCode: string,
	localNumber: unknown,
	maxLength?: number,
): string => {
	const local = compactPhone(localNumber)
	if (!local) {
		return ''
	}
	const maxLocal =
		maxLength == null
			? local.length
			: Math.max(0, maxLength - countryCode.length)
	return `${countryCode}${local.slice(0, maxLocal)}`
}

/**
 * 接口 `phone` 是否能过表单。空串返回 false，空值交给 `required`。
 * 86：大陆手机 / 座机；其它区号走 E.164（含区号 8～15 位）。
 */
export const isValidPhone = (value: unknown): boolean => {
	const digits = compactPhone(value)
	if (!digits) {
		return false
	}
	const { countryCode, localNumber } = parsePhone(digits)
	if (!localNumber || !/^\d+$/.test(localNumber)) {
		return false
	}
	if (countryCode === CHINA_COUNTRY_CODE) {
		return (
			/^1[3-9]\d{9}$/.test(localNumber) ||
			/^0\d{2,3}\d{7,8}$/.test(localNumber)
		)
	}
	const e164 = `${countryCode}${localNumber}`
	return /^[1-9]\d{6,14}$/.test(e164)
}
