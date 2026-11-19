import type {Slice, Node as ProseNode} from '@tiptap/pm/model'

const LIST_TYPES = new Set(['bulletList', 'orderedList', 'taskList'])
const ITEM_TYPES = new Set(['listItem', 'taskItem'])

// Plain-text serialization for copied content. ProseMirror's default drops list
// markers entirely, so a copied bullet list would paste as bare lines.
export function sliceToPlainText(slice: Slice): string {
	const lines: string[] = []
	slice.content.forEach(node => collectLines(node, '', lines))
	return lines.join('\n')
}

function collectLines(node: ProseNode, indent: string, lines: string[]) {
	if (LIST_TYPES.has(node.type.name)) {
		node.forEach(item => collectLines(item, indent, lines))
		return
	}

	if (ITEM_TYPES.has(node.type.name)) {
		let isFirstBlock = true
		node.forEach(child => {
			if (child.isTextblock && isFirstBlock) {
				lines.push(`${indent}- ${child.textContent}`)
				isFirstBlock = false
			} else if (child.isTextblock) {
				lines.push(`${indent}  ${child.textContent}`)
			} else {
				collectLines(child, `${indent}  `, lines)
			}
		})
		return
	}

	if (node.isTextblock) {
		lines.push(`${indent}${node.textContent}`)
		return
	}

	node.forEach(child => collectLines(child, indent, lines))
}
