import { reviewRecordCreate, reviewRecordDetail } from '@/api/review-record'
import { ReviewRecordReviewStatus } from '@/enum/review-record/review-status'

/** 弹窗还开着时，隔这么久查一次该任务详情 */
const DETAIL_POLL_INTERVAL = 10000

interface DetailOptions {
	isOpen: () => boolean
	isCollapsed: () => boolean
	/** 详情已不是审核中 */
	onReviewEnded: () => void
}

/** 创建审核和详情轮询。关窗会把 session 加一，创建回包对不上就丢掉。收起只停详情轮询 */
export const useReviewDetail = (options: DetailOptions) => {
	/** 同一次弹窗的创建请求；收起不加，创建回包仍要落到那条草稿 */
	let sessionId = 0
	/** 详情轮询代数。收起 clear 就加一，在途详情回包对不上直接丢掉 */
	let detailEpoch = 0
	/** 创建接口带回的记录 id；弹窗未关时用它查详情 */
	let createdRecordId = 0
	/** 弹窗未关时的详情轮询；收起后清掉，不再查这一条 */
	let detailPollTimer: ReturnType<typeof setTimeout> | undefined

	const clear = () => {
		clearTimeout(detailPollTimer)
		detailPollTimer = undefined
		detailEpoch += 1
	}

	const bump = () => {
		sessionId += 1
		clear()
		createdRecordId = 0
		return sessionId
	}

	const isStale = (session: number) => {
		return (
			session !== sessionId || options.isCollapsed() || !options.isOpen()
		)
	}

	/** 弹窗还开着才查详情；仍是审核中就再等 10 秒。收起后不再查 */
	const schedule = (session: number) => {
		clear()
		detailPollTimer = setTimeout(() => {
			if (isStale(session)) {
				return
			}
			const id = createdRecordId
			if (!id) {
				return
			}
			const epoch = detailEpoch
			reviewRecordDetail(id)
				.then((res) => {
					if (epoch !== detailEpoch || isStale(session)) {
						return
					}
					const reviewStatus = res.data?.reviewStatus
					const stillReviewing =
						reviewStatus == null ||
						reviewStatus === ReviewRecordReviewStatus.Reviewing
					if (stillReviewing) {
						schedule(session)
						return
					}
					options.onReviewEnded()
				})
				.catch(() => {
					if (epoch !== detailEpoch || isStale(session)) {
						return
					}
					schedule(session)
				})
		}, DETAIL_POLL_INTERVAL)
	}

	const create = (
		data: ReviewRecordCreateData,
		handlers: {
			onCreated: () => void
			onFail: () => void
		},
	) => {
		const session = sessionId
		reviewRecordCreate(data)
			.then((res) => {
				if (session !== sessionId) {
					return
				}
				const createdId = res.data
				if (!createdId) {
					handlers.onFail()
					return
				}
				createdRecordId = createdId
				handlers.onCreated()
			})
			.catch(() => {
				if (session !== sessionId) {
					return
				}
				handlers.onFail()
			})
	}

	const getRecordId = () => {
		return createdRecordId
	}

	const getSessionId = () => {
		return sessionId
	}

	return {
		bump,
		clear,
		schedule,
		create,
		getRecordId,
		getSessionId,
	}
}
