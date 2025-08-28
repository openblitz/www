import { diffLines, createPatch } from 'diff';

export interface DiffLine {
	type: 'added' | 'removed' | 'unchanged';
	content: string;
	oldLineNumber?: number;
	newLineNumber?: number;
}

export interface DiffResult {
	lines: DiffLine[];
	patch: string;
}

export function computeDiff(oldText: string, newText: string, filename?: string): DiffResult {
	
	const changes = diffLines(oldText, newText);
	const lines: DiffLine[] = [];
	
	let oldLineNumber = 1;
	let newLineNumber = 1;
	
	for (const change of changes) {
		const changeLines = change.value.split('\n');
		// Remove the last empty line that split creates
		if (changeLines[changeLines.length - 1] === '') {
			changeLines.pop();
		}
		
		for (let i = 0; i < changeLines.length; i++) {
			const line = changeLines[i];
			
			if (change.added) {
				lines.push({
					type: 'added',
					content: line,
					newLineNumber: newLineNumber++
				});
			} else if (change.removed) {
				lines.push({
					type: 'removed',
					content: line,
					oldLineNumber: oldLineNumber++
				});
			} else {
				lines.push({
					type: 'unchanged',
					content: line,
					oldLineNumber: oldLineNumber++,
					newLineNumber: newLineNumber++
				});
			}
		}
	}
	
	// Generate patch
	const patch = createPatch(
		filename || 'file.txt',
		oldText,
		newText
	);
	
	return { lines, patch };
}