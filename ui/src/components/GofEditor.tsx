import * as monaco from 'monaco-editor'
import { onCleanup, onMount } from 'solid-js';
import { VimMode, initVimMode, type VimAdapterInstance } from 'monaco-vim'

import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'

fetch('/themes/Monokai.json')
.then((data) => data.json())
.then((data => {
    monaco.editor.defineTheme('monokai', (data as any).default || data)
    monaco.editor.setTheme('monokai')
}))

self.MonacoEnvironment = {
    getWorker: function(_: any, _label: string) {
        return new editorWorker()
    }
}

export default function GofEditor(props: { content?: string, on_content: (_: string) => void, on_command: (_: string) => void }) {

    function getCurrentVimMode() {
        let statusNode = $status
        if (!statusNode) return 'normal';
        const text = statusNode.textContent || '';
        // Status bar typically shows "-- INSERT --", "-- NORMAL --", "-- VISUAL --", etc.
        if (text.includes('INSERT')) return 'insert';
        if (text.includes('VISUAL')) return 'visual';
        if (text.includes('NORMAL')) return 'normal';
        return 'normal';
    }

    onMount(() => {
        let editor = monaco.editor.create($el, {
            value: props.content ?? '',
            minimap: {enabled: false },
            lineDecorationsWidth: 1,
            lineNumbersMinChars: 3,
            automaticLayout: true
        })

        let vimMode: VimAdapterInstance

        document.addEventListener('keydown', (e) => {
            let currentVimMode = getCurrentVimMode()
            if (e.key === 'j') {
                if (e.ctrlKey) {
                    e.preventDefault()
                    e.stopPropagation()
                    // If in normal mode, move down one line
                    if (currentVimMode === 'normal') {
                        editor.trigger('keyboard', 'cursorMove', {
                            to: 'down',
                            by: 'line',
                            value: 1
                        });
                    }
                    // If in insert mode, insert a newline
                    else if (currentVimMode === 'insert') {
                        editor.trigger('keyboard', 'type', { text: '\n' });
                    }

                    /*
                    editor.trigger('keyboard', 'cursorMove', {
                        to: 'down',
                        by: 'line',
                        value: 1
                    });
                    editor.trigger('keyboard', 'lineBreakInsert', null)
                    */
                   //editor.trigger('keyboard', 'type', { text: '\r' });

                   /*

                    // Create and dispatch a real Enter key event
                    const enterEvent = new KeyboardEvent('keydown', {
                        key: 'Enter',
                        code: 'Enter',
                        keyCode: 13,
                        which: 13,
                        bubbles: true
                    });

                    editor.getDomNode()?.dispatchEvent(enterEvent);
                    */
                }
            }
        })

        vimMode = initVimMode(editor, $status)

        //VimMode.Vim.map('<C-j>', '<Enter>', 'insert')

        //@ts-ignore
        VimMode.Vim.defineEx('write', 'w', () => {
            props.on_command('write')
        })
        //@ts-ignore
        VimMode.Vim.defineEx('pass', 'p', () => {
            props.on_command('pass')
        })

        onCleanup(() => {
            editor.dispose()
            vimMode.dispose()
        })


        editor.onDidChangeModelContent(() => {
            props.on_content(editor.getValue())
        })

        setTimeout(() => editor.focus(), 0)
    })

    let $el!: HTMLDivElement
    let $status!: HTMLDivElement

    return (<>
    <div class='flex-1 flex flex-col'>
            <div ref={$el} class='flex-1'>
            </div>
            <div ref={$status}></div>
        </div>
    </>)
}