<script lang="ts">
	import { worker } from '$lib';
	import type { DiffResult } from '../../worker/diff';
	import ThemeToggle from '$lib/ThemeToggle.svelte';
	import { DownloadOutline, ClipboardOutline, CheckOutline } from 'flowbite-svelte-icons';
	import { Toast, Button } from 'flowbite-svelte';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { onMount, onDestroy } from 'svelte';

	let leftText = '';
	let rightText = '';
	let diffResult: DiffResult | null = null;
	let isLoading = false;
	let leftTextarea: HTMLTextAreaElement;
	let rightTextarea: HTMLTextAreaElement;
	let leftHighlightOverlay: HTMLDivElement;
	let rightHighlightOverlay: HTMLDivElement;
	let leftLineNumbers: HTMLDivElement;
	let rightLineNumbers: HTMLDivElement;
	
	// Toast notification state
	let showToast = false;
	let toastMessage = '';
	let copySuccess = false;

	// Auto-resize textarea functionality
	function autoResize(textarea: HTMLTextAreaElement) {
		if (!textarea) return;
		
		// Reset height to auto to get the correct scrollHeight
		textarea.style.height = 'auto';
		// Set height to scrollHeight to fit content, with minimum height
		const minHeight = 400;
		const newHeight = Math.max(textarea.scrollHeight, minHeight);
		textarea.style.height = newHeight + 'px';
	}

	// Update line numbers when textarea dimensions change
	function updateLineNumbers() {
		// Trigger reactive updates
		leftLineNumbersText = getLineNumbers(leftText, leftTextarea);
		rightLineNumbersText = getLineNumbers(rightText, rightTextarea);
	}

	// Handle window resize to update line numbers
	let resizeTimeout: number;
	function handleResize() {
		if (!browser) return;
		clearTimeout(resizeTimeout);
		resizeTimeout = setTimeout(updateLineNumbers, 100);
	}

	// Generate line numbers for editors, accounting for line wrapping
	function getLineNumbers(text: string, textarea: HTMLTextAreaElement | null = null): string {
		if (!text) return '1';
		
		const lines = text.split('\n');
		
		// SSR check - if we're on the server or don't have browser APIs, fall back to simple numbering
		if (!browser || !textarea) {
			return lines.map((_, i) => i + 1).join('\n');
		}
		
		// Create a temporary div with the same styling as the textarea to measure wrapping
		const measureDiv = document.createElement('div');
		const computedStyle = window.getComputedStyle(textarea);
		
		// Copy relevant styles
		measureDiv.style.position = 'absolute';
		measureDiv.style.visibility = 'hidden';
		measureDiv.style.whiteSpace = 'pre-wrap'; // Important for wrapping behavior
		measureDiv.style.wordWrap = 'break-word';
		measureDiv.style.fontFamily = computedStyle.fontFamily;
		measureDiv.style.fontSize = computedStyle.fontSize;
		measureDiv.style.lineHeight = computedStyle.lineHeight;
		measureDiv.style.padding = '0';
		measureDiv.style.margin = '0';
		measureDiv.style.border = 'none';
		measureDiv.style.width = (textarea.clientWidth - 
			parseFloat(computedStyle.paddingLeft || '0') - 
			parseFloat(computedStyle.paddingRight || '0')) + 'px';
		
		document.body.appendChild(measureDiv);
		
		const visualLineNumbers: string[] = [];
		let currentLogicalLine = 1;
		
		try {
			for (const line of lines) {
				if (line.length === 0) {
					// Empty line
					visualLineNumbers.push(currentLogicalLine.toString());
				} else {
					// Measure how many visual lines this logical line will take
					measureDiv.textContent = line;
					const divHeight = measureDiv.scrollHeight;
					const lineHeight = parseFloat(computedStyle.lineHeight) || 
						parseFloat(computedStyle.fontSize) * 1.25;
					const wrappedLines = Math.max(1, Math.round(divHeight / lineHeight));
					
					// Add the logical line number for the first visual line
					visualLineNumbers.push(currentLogicalLine.toString());
					
					// Add empty strings for subsequent wrapped lines
					for (let i = 1; i < wrappedLines; i++) {
						visualLineNumbers.push('');
					}
				}
				currentLogicalLine++;
			}
		} finally {
			document.body.removeChild(measureDiv);
		}
		
		return visualLineNumbers.join('\n');
	}

	async function computeDiff() {
		if (!leftText && !rightText) {
			diffResult = null;
			clearHighlighting();
			return;
		}
		
		isLoading = true;
		try {
			diffResult = await worker.diff(leftText, rightText, 'file.txt');
			updateOverlayHighlighting();
		} catch (error) {
			console.error('Error computing diff:', error);
		} finally {
			isLoading = false;
		}
	}

	function clearHighlighting() {
		if (leftHighlightOverlay) leftHighlightOverlay.innerHTML = '';
		if (rightHighlightOverlay) rightHighlightOverlay.innerHTML = '';
	}

	function updateOverlayHighlighting() {
		if (!diffResult || !leftHighlightOverlay || !rightHighlightOverlay) return;

		// Create line-by-line background highlighting
		const leftLines = leftText.split('\n');
		const rightLines = rightText.split('\n');
		
		// Build a simple line mapping based on line numbers in diff result
		const leftHighlights: string[] = new Array(leftLines.length).fill('unchanged');
		const rightHighlights: string[] = new Array(rightLines.length).fill('unchanged');
		
		// Mark lines based on diff results
		for (const diffLine of diffResult.lines) {
			if (diffLine.oldLineNumber && diffLine.type === 'removed') {
				leftHighlights[diffLine.oldLineNumber - 1] = 'removed';
			}
			if (diffLine.newLineNumber && diffLine.type === 'added') {
				rightHighlights[diffLine.newLineNumber - 1] = 'added';
			}
		}
		
		// Generate HTML for left overlay
		let leftHTML = '';
		// Try to use line wrapping if available, otherwise fall back to simple highlighting
		if (browser && leftTextarea && leftTextarea.clientWidth > 0) {
			try {
				leftHTML = generateWrappedHighlightHTML(leftLines, leftHighlights, leftTextarea);
			} catch (error) {
				console.warn('Line wrapping failed, falling back to simple highlighting:', error);
				leftHTML = generateSimpleHighlightHTML(leftLines, leftHighlights);
			}
		} else {
			leftHTML = generateSimpleHighlightHTML(leftLines, leftHighlights);
		}
		
		// Generate HTML for right overlay
		let rightHTML = '';
		// Try to use line wrapping if available, otherwise fall back to simple highlighting
		if (browser && rightTextarea && rightTextarea.clientWidth > 0) {
			try {
				rightHTML = generateWrappedHighlightHTML(rightLines, rightHighlights, rightTextarea);
			} catch (error) {
				console.warn('Line wrapping failed, falling back to simple highlighting:', error);
				rightHTML = generateSimpleHighlightHTML(rightLines, rightHighlights);
			}
		} else {
			rightHTML = generateSimpleHighlightHTML(rightLines, rightHighlights);
		}
		
		// Update overlays
		leftHighlightOverlay.innerHTML = `<div class="highlight-container">${leftHTML}</div>`;
		rightHighlightOverlay.innerHTML = `<div class="highlight-container">${rightHTML}</div>`;
	}

	// Simple highlight HTML generation (fallback)
	function generateSimpleHighlightHTML(lines: string[], highlights: string[]): string {
		let html = '';
		lines.forEach((line, index) => {
			const type = highlights[index];
			const escapedLine = line.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/ /g, '&nbsp;') || '&nbsp;';
			html += `<div class="line-highlight line-${type}">${escapedLine}</div>`;
		});
		return html;
	}

	function generateWrappedHighlightHTML(lines: string[], highlights: string[], textarea: HTMLTextAreaElement): string {
		if (!browser) return '';

		// Create a temporary div with the same styling as the textarea to measure wrapping
		const measureDiv = document.createElement('div');
		const computedStyle = window.getComputedStyle(textarea);
		
		// Copy relevant styles
		measureDiv.style.position = 'absolute';
		measureDiv.style.visibility = 'hidden';
		measureDiv.style.whiteSpace = 'pre-wrap';
		measureDiv.style.wordWrap = 'break-word';
		measureDiv.style.fontFamily = computedStyle.fontFamily;
		measureDiv.style.fontSize = computedStyle.fontSize;
		measureDiv.style.lineHeight = computedStyle.lineHeight;
		measureDiv.style.padding = '0';
		measureDiv.style.margin = '0';
		measureDiv.style.border = 'none';
		measureDiv.style.width = (textarea.clientWidth - 
			parseFloat(computedStyle.paddingLeft || '0') - 
			parseFloat(computedStyle.paddingRight || '0')) + 'px';
		
		document.body.appendChild(measureDiv);
		
		let html = '';
		
		try {
			lines.forEach((line, index) => {
				const type = highlights[index];
				const escapedLine = line.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/ /g, '&nbsp;') || '&nbsp;';
				
				if (line.length === 0) {
					// Empty line
					html += `<div class="line-highlight line-${type}">${escapedLine}</div>`;
				} else {
					// Measure how many visual lines this logical line will take
					measureDiv.textContent = line;
					const divHeight = measureDiv.scrollHeight;
					const lineHeight = parseFloat(computedStyle.lineHeight) || 
						parseFloat(computedStyle.fontSize) * 1.25;
					const wrappedLines = Math.max(1, Math.round(divHeight / lineHeight));
					
					if (wrappedLines === 1) {
						// Single line, no wrapping
						html += `<div class="line-highlight line-${type}">${escapedLine}</div>`;
					} else {
						// Line wraps - we need to split the content appropriately
						// For now, apply the highlight to all wrapped lines
						// TODO: More sophisticated wrapping that splits the actual content
						for (let i = 0; i < wrappedLines; i++) {
							if (i === 0) {
								// First line gets the content (simplified)
								html += `<div class="line-highlight line-${type}">${escapedLine}</div>`;
							} else {
								// Subsequent wrapped lines are empty but maintain highlighting
								html += `<div class="line-highlight line-${type}">&nbsp;</div>`;
							}
						}
					}
				}
			});
		} finally {
			document.body.removeChild(measureDiv);
		}
		
		return html;
	}
		

	function exportPatch() {
		// Generate patch content - either from diff result or empty if no content
		let patchContent = '';
		
		if (diffResult && diffResult.patch) {
			patchContent = diffResult.patch;
		} else {
			// Generate empty patch when no content is available
			patchContent = `diff --git a/file.txt b/file.txt
index 0000000..0000000 100644
--- a/file.txt
+++ b/file.txt
@@ -0,0 +0,0 @@
`;
		}
		
		const blob = new Blob([patchContent], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'diff.patch';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
		
		showPatchCommandToast();
	}

	function showPatchCommandToast() {
		toastMessage = 'patch -p1 file.txt < ~/Downloads/diff.patch';
		copySuccess = false;
		showToast = true;
		
		setTimeout(() => {
			showToast = false;
		}, 10000);
	}
	
	async function copyPatchCommand() {
		try {
			if (browser && navigator.clipboard) {
				await navigator.clipboard.writeText(toastMessage);
				copySuccess = true;
				setTimeout(() => {
					copySuccess = false;
				}, 2000);
			}
		} catch (err) {
			console.error('Failed to copy: ', err);
		}
	}

	let debounceTimer: number;
	$: {
		if (leftText !== undefined && rightText !== undefined) {
			clearTimeout(debounceTimer);
			debounceTimer = setTimeout(computeDiff, 300);
		}
	}

	$: leftLineNumbersText = browser ? getLineNumbers(leftText, leftTextarea) : getLineNumbers(leftText);
	$: rightLineNumbersText = browser ? getLineNumbers(rightText, rightTextarea) : getLineNumbers(rightText);

	// Auto-resize textareas when content changes
	$: if (leftTextarea && leftText !== undefined) {
		autoResize(leftTextarea);
		// Update line numbers after resize
		setTimeout(() => updateLineNumbers(), 0);
	}

	$: if (rightTextarea && rightText !== undefined) {
		autoResize(rightTextarea);
		// Update line numbers after resize
		setTimeout(() => updateLineNumbers(), 0);
	}

	// Handle window resize events
	onMount(() => {
		if (browser) {
			window.addEventListener('resize', handleResize);
		}
	});

	onDestroy(() => {
		if (browser) {
			window.removeEventListener('resize', handleResize);
			clearTimeout(resizeTimeout);
		}
	});
</script>

<svelte:head>
	<title>Diff</title>
</svelte:head>

<header class="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-600 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">
	<section class="flex flex-col md:flex-row md:items-start gap-4 justify-between md:mb-2 px-4 py-4 md:px-8 xl:px-12 2xl:px-16">
		<section class="flex flex-col gap-2">
			<div class="flex items-center justify-between">
				<h1 class="font-bold text-4xl text-primary-900 tracking-tighter">Diff</h1>
				<div class="md:hidden">
					<ThemeToggle serverTheme={$page.data?.theme} />
				</div>
			</div>
			<p class="ml-0.5 text-gray-500 dark:text-gray-400">Made with love by <a class="underline hover:text-primary-600 dark:hover:text-primary-400" href="https://shukantpal.com" target="_blank">Shukant Pal</a></p>
		</section>
		<div class="flex gap-2 items-start">
			<div class="hidden md:block">
				<ThemeToggle serverTheme={$page.data?.theme} />
			</div>
			<!-- Always show patch button -->
			<Button
				on:click={exportPatch}
				color="alternative"
				size="sm"
				class="whitespace-nowrap"
			>
				<DownloadOutline class="w-4 h-4 me-2" />
				Export Patch
			</Button>
			{#if isLoading}
				<div class="px-3 py-2 text-gray-600 dark:text-gray-400 text-sm whitespace-nowrap">Computing diff...</div>
			{/if}
		</div>
	</section>
</header>

<main class="flex flex-col gap-4 w-full min-w-0 px-4 pt-32 pb-8 md:px-8 md:pt-36 md:pb-12 xl:px-12 2xl:px-16">
	<div class="flex flex-col lg:flex-row gap-4 w-full">
		<!-- Left side - Original -->
		<div class="flex-1 flex flex-col min-w-0">
			<div class="bg-gray-50 dark:bg-gray-700 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-t-md">
				<h2 class="font-medium text-gray-900 dark:text-gray-100">Original</h2>
			</div>
			<div class="flex border-l border-r border-b border-gray-200 dark:border-gray-600 rounded-b-md">
				<!-- Line numbers -->
				<div class="w-12 bg-gray-50 dark:bg-gray-700 border-r border-gray-200 dark:border-gray-600">
					<div
						bind:this={leftLineNumbers}
						data-testid="left-line-numbers"
						class="p-2 text-xs font-mono text-gray-500 dark:text-gray-400 leading-5 whitespace-pre"
					>
						{leftLineNumbersText}
					</div>
				</div>
				<!-- Text editor with overlay -->
				<div class="flex-1 relative bg-white dark:bg-gray-900">
					<!-- Highlight overlay -->
					<div
						bind:this={leftHighlightOverlay}
						class="absolute inset-0 text-sm font-mono pointer-events-none"
					></div>
					<!-- Text area -->
					<textarea
						bind:this={leftTextarea}
						bind:value={leftText}
						on:input={() => autoResize(leftTextarea)}
						class="w-full font-mono text-sm bg-transparent text-gray-900 dark:text-gray-100 resize-none border-none outline-none p-2 z-10 relative auto-resize"
						placeholder="Enter original text..."
						spellcheck="false"
					></textarea>
				</div>
			</div>
		</div>

		<!-- Right side - Modified -->
		<div class="flex-1 flex flex-col min-w-0">
			<div class="bg-gray-50 dark:bg-gray-700 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-t-md">
				<h2 class="font-medium text-gray-900 dark:text-gray-100">Modified</h2>
			</div>
			<div class="flex border-l border-r border-b border-gray-200 dark:border-gray-600 rounded-b-md">
				<!-- Line numbers -->
				<div class="w-12 bg-gray-50 dark:bg-gray-700 border-r border-gray-200 dark:border-gray-600">
					<div
						bind:this={rightLineNumbers}
						data-testid="right-line-numbers"
						class="p-2 text-xs font-mono text-gray-500 dark:text-gray-400 leading-5 whitespace-pre"
					>
						{rightLineNumbersText}
					</div>
				</div>
				<!-- Text editor with overlay -->
				<div class="flex-1 relative bg-white dark:bg-gray-900">
					<!-- Highlight overlay -->
					<div
						bind:this={rightHighlightOverlay}
						class="absolute inset-0 text-sm font-mono pointer-events-none"
					></div>
					<!-- Text area -->
					<textarea
						bind:this={rightTextarea}
						bind:value={rightText}
						on:input={() => autoResize(rightTextarea)}
						class="w-full font-mono text-sm bg-transparent text-gray-900 dark:text-gray-100 resize-none border-none outline-none p-2 z-10 relative auto-resize"
						placeholder="Enter modified text..."
						spellcheck="false"
					></textarea>
				</div>
			</div>
		</div>
	</div>
</main>

{#if showToast}
	<Toast dismissable={false} class="fixed bottom-8 right-8 w-fit z-50 shadow-lg">
		<div class="flex-1 w-fit pointer-events-auto">
			<p class="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
				Apply patch with this command:
			</p>
			<div class="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded px-3 py-2">
				<code class="text-sm font-mono text-gray-800 dark:text-gray-200 flex-1">
					{toastMessage}
				</code>
				<button
					on:click={copyPatchCommand}
					class="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
					title="Copy to clipboard"
				>
					{#if copySuccess}
						<CheckOutline class="w-4 h-4 text-green-600" />
					{:else}
						<ClipboardOutline class="w-4 h-4 text-gray-600 dark:text-gray-400" />
					{/if}
				</button>
			</div>
		</div>
	</Toast>
{/if}

<style>
	textarea {
		line-height: 1.25rem;
		font-family: ui-monospace, SFMono-Regular, "SF Mono", Monaco, Inconsolata, "Roboto Mono", monospace;
		font-size: 14px;
		padding: 8px;
		margin: 0;
		border: none;
		outline: none;
		resize: none;
		overflow: hidden;
		width: 100%;
		height: auto;
		min-height: 400px;
		box-sizing: border-box;
		white-space: pre-wrap; /* Enable text wrapping */
		word-wrap: break-word; /* Break long words */
		overflow-wrap: break-word; /* Modern alternative to word-wrap */
	}
	
	/* Fallback for browsers that don't support field-sizing */
	@supports not (field-sizing: content) {
		textarea {
			height: auto;
		}
	}
	
	:global(.highlight-container) {
		margin: 0;
		padding: 8px;
		line-height: 1.25rem;
		font-family: ui-monospace, SFMono-Regular, "SF Mono", Monaco, Inconsolata, "Roboto Mono", monospace;
		font-size: 14px;
		white-space: pre;
		pointer-events: none;
		color: transparent; /* Make text invisible, only show backgrounds */
	}
	
	:global(.line-highlight) {
		display: block;
		width: 100%;
		height: 1.25rem;
		line-height: 1.25rem;
		margin: 0;
		padding: 0;
	}
	
	:global(.line-removed) {
		background-color: #fef2f2;
		border-left: 3px solid #dc2626;
		margin-left: -3px;
		padding-left: 3px;
	}
	
	:global(.line-added) {
		background-color: #f0fdf4;
		border-left: 3px solid #16a34a;
		margin-left: -3px;
		padding-left: 3px;
	}
	
	:global(.line-unchanged) {
		background-color: transparent;
	}
	
	/* Dark mode colors */
	:global(.dark .line-removed) {
		background-color: rgba(239, 68, 68, 0.15);
		border-left-color: #ef4444;
	}
	
	:global(.dark .line-added) {
		background-color: rgba(34, 197, 94, 0.15);
		border-left-color: #22c55e;
	}
	
	/* Ensure proper layering and positioning */
	.relative {
		position: relative;
	}

	/* System preference dark mode for container backgrounds - only when no explicit class */
	@media (prefers-color-scheme: dark) {
		:global(html:not(.light):not(.dark)) .bg-white {
			background-color: rgb(17 24 39) !important; /* gray-900 */
		}
		
		:global(html:not(.light):not(.dark)) .bg-gray-50 {
			background-color: rgb(55 65 81) !important; /* gray-700 */
		}
		
		:global(html:not(.light):not(.dark)) .border-gray-200 {
			border-color: rgb(75 85 99) !important;
		}
		
		:global(html:not(.light):not(.dark)) .text-gray-900 {
			color: rgb(243 244 246) !important;
		}
		
		:global(html:not(.light):not(.dark)) .text-gray-500 {
			color: rgb(156 163 175) !important;
		}
	}
</style>