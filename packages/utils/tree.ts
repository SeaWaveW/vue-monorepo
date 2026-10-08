/**
 * `flatToTree` 挂好的节点：原行字段 + 指定的子节点字段。
 * 不叫 `TreeNode`：那个名字给 `@saco/ui` 的树组件。从 `@saco/common/utils` 取。
 */
export type FlatTreeNode<D, C extends string = 'children'> = D & {
	[Child in C]: FlatTreeNode<D, C>[]
}

/**
 * 一维列表按 `parentKey` 挂成树，子节点写到 `childKey`。
 * 父节点不在本批里当根；自己指自己也当根，避免成环。
 * 浅拷贝每一项，不改原数组。从 `@saco/common/utils` 取。纯函数。
 *
 * @example
 * ```ts
 * const tree = flatToTree(navigations, 'id', 'parentId', 'children')
 * ```
 */
export const flatToTree = <
	D extends Record<K, PropertyKey> & Record<P, PropertyKey>,
	K extends keyof D,
	P extends keyof D,
	C extends string,
>(
	data: D[],
	key: K,
	parentKey: P,
	childKey: C,
): FlatTreeNode<D, C>[] => {
	const roots: FlatTreeNode<D, C>[] = []
	const nodeMap = new Map<PropertyKey, FlatTreeNode<D, C>>()

	for (const item of data) {
		const children: FlatTreeNode<D, C>[] = []
		// computed [childKey] 会被推成 string 索引，对不上 C
		const node = {
			...item,
			[childKey]: children,
		} as FlatTreeNode<D, C>
		nodeMap.set(item[key], node)
	}

	for (const node of nodeMap.values()) {
		const parent = nodeMap.get(node[parentKey])
		// 情况1：父在本批且不是自己，挂到父的 childKey
		if (parent && parent !== node) {
			parent[childKey].push(node)
			continue
		}
		// 情况2：顶级 / 父不在本批 / 自己指自己，当根
		roots.push(node)
	}

	return roots
}

/**
 * 树按 `childKey` 压成一维列表，去掉子节点字段。
 * 先序（父在子前）。浅拷贝，不改原树。从 `@saco/common/utils` 取。纯函数。
 *
 * @example
 * ```ts
 * const list = treeToFlat(tree, 'children')
 * ```
 */
export const treeToFlat = <D extends object, C extends keyof D & string>(
	data: D[],
	childKey: C,
): Omit<D, C>[] => {
	const result: Omit<D, C>[] = []
	const walk = (nodes: D[]) => {
		for (const item of nodes) {
			const { [childKey]: nested, ...row } = item
			result.push(row)
			// 情况1：还有子树，继续先序压平
			if (Array.isArray(nested) && nested.length) {
				walk(nested)
			}
		}
	}
	walk(data)
	return result
}
