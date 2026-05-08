import { Chessboard } from "../components/Chessboard";
import { createMemo, createSelector, createSignal, For, Show } from "solid-js";
import { A } from "@solidjs/router";
import GofEditor from "../components/GofEditor";
import GofEditorOutput from "../components/GofEditorOutput";
import { useState } from "../state/State";
import { CoverageResult } from "../state/worker_types";
import type { Color } from "hopefox";

export default function SolvePage() {

    const [{ gofchess_state }, { gofchess_actions: { toggle_vim_mode, save_work, reset_to_help_script } }] = useState()

    const [is_copied, set_is_copied] = createSignal(false)

    const copy_text = () => {
        navigator.clipboard.writeText(gofchess_state.code)

        set_is_copied(true)
        setTimeout(() => {
            set_is_copied(false)
        }, 1000)

    }

    return (<>
        <div class='flex-1 flex mx-1 mt-0.5 gap-1'>
            <button onClick={toggle_vim_mode} class={`p-1 text-lime-50 select-none cursor-pointer text-center rounded 
            ${
                !gofchess_state.vim_mode_enabled ? 'bg-green-400 hover:bg-green-500 active:bg-green-600' : 'bg-slate-400 hover:bg-slate-500 active:bg-slate-600'
                }`}>Vim Mode {gofchess_state.vim_mode_enabled?'Enabled': 'Disabled'} </button>

            <button onClick={save_work} class='text-lime-50 select-none cursor-pointer p-2 text-center rounded bg-green-400 hover:bg-green-500 active:bg-green-600'>Save the script</button>
            <button onClick={copy_text} class='text-taupe-50 select-none cursor-pointer p-2 text-center rounded bg-taupe-400 hover:bg-taupe-500 active:bg-taupe-600'>{is_copied()?'Copied' : 'Copy Script'}</button>
            <div class='flex-1'></div>
            <button onClick={reset_to_help_script} class='text-lime-50 select-none cursor-pointer p-2 text-center rounded bg-red-400 hover:bg-red-500 active:bg-red-600'>Reset to help script ?</button>
        </div>

        <div class='flex-1 flex gap-1 p-0.5'>
            <div class='flex flex-1'>
                <ChessboardGroup />
            </div>
        </div>
        <div class='flex-1 flex p-0.5 gap-1'>
            <div class='flex flex-col flex-2'>
                <ChesslineGroup />
            </div>
            <div class='flex-1'>
                <ChessInfoGroup />
            </div>
        </div>
    </>)
}

type Tab = 'tp' | 'fp' | 'ne'
export function ChesslineGroup() {

    const [tab, set_tab] = createSignal<Tab>('tp')

    const [{ gofchess_state: state, worker_state }, { gofchess_actions: { save_work, set_selected_puzzle_id }}] = useState()

    const Tp_list = createMemo(() => 
        worker_state.batch_in_progress_merged.partial_out
            .filter(_ => _.coverage.result === CoverageResult.Tp))
    const Fp_list = createMemo(() => 
        worker_state.batch_in_progress_merged.partial_out
            .filter(_ => _.coverage.result === CoverageResult.Fp))
    const N_list = createMemo(() => 
        worker_state.batch_in_progress_merged.partial_out
            .filter(_ => _.coverage.result === CoverageResult.N))

    const list = createMemo(() => tab() === 'tp' ? Tp_list() : tab() === 'fp' ? Fp_list() : N_list())

    const cut_list = createMemo(() => list().slice(0, 100))

    const is_selected_tab = createSelector(tab)

    const coverage = createMemo(() => worker_state.batch_in_progress_merged.running_coverage)

    const running_times = createMemo(() => worker_state.batch_in_progress_merged.running_times)

    const is_selected_puzzle = createSelector(() => state.selected_puzzle_id)


    return (<>
        <div class='flex flex-col bg-silver-900 rounded border border-slate-500 h-full'>
            <div class='flex justify-around leading-3'>
                <Show when={coverage()} fallback={
                    <>
                        <span class='text-center flex-2 p-2 bg-pink-500 text-blue-100'>Coverage: %---</span>
                        <span class='text-center flex-2 p-2 bg-pink-500 text-blue-100'>Accuracy: %---</span>
                        <span class='text-center text-nowrap flex-3 p-2 bg-pink-500 text-blue-100'>Tp/Fp: --/-- N: -- Total: --</span>
                    </>
                }>{ coverage => 
                    <>
                        <span class='text-center flex-2 p-2 bg-pink-500 text-blue-100'>Coverage: %{Math.round(coverage().percent)}</span>
                        <span class='text-center flex-2 p-2 bg-pink-500 text-blue-100'>Accuracy: %{Math.round(coverage().accuracy)}</span>
                        <span class='text-center text-nowrap flex-3 p-2 bg-pink-500 text-blue-100'>Tp/Fp: {coverage().Tp}/{coverage().Fp} N: {coverage().N} Total: {coverage().Total}</span>
                    </>
                }</Show>

                <Show when={running_times()} fallback={
                    <>
                        <span class='text-center flex-2 p-2 bg-pink-500 text-blue-100'>Time per puzzle: --</span>
                        <span class='text-center flex-2 p-2 bg-pink-500 text-blue-100'>took --</span>
                    </>
                }>{times =>
                        <>
                            <span class='text-center flex-2 p-2 bg-pink-500 text-blue-100'>Time per puzzle: {Math.round(times().per_puzzle_ms * 100) / 100}ms</span>
                            <span class='text-center flex-2 p-2 bg-pink-500 text-blue-100'>took {Math.round(times().total_seconds)}s</span>
                        </>
                    }</Show>
            </div>
            <div class='flex flex-row h-full'>
                <div class='flex flex-col'>
                    <div onClick={() => set_tab('tp')} class={`${is_selected_tab('tp') ? 'bg-indigo-700' : 'bg-slate-500'} select-none cursor-pointer hover:bg-indigo-800 flex-1 text-green-100 border-b-2 justify-center items-center flex flex-col px-2`}><div>True Positives</div> <div>({coverage()?.Tp ?? '--'})</div></div>
                    <div onClick={() => set_tab('fp')} class={`${is_selected_tab('fp')? 'bg-indigo-700' : 'bg-slate-500' } select-none cursor-pointer hover:bg-indigo-800 flex-1 text-green-100 border-b-2 justify-center items-center flex flex-col px-2`}><div>False Positives </div><div>({coverage()?.Fp ?? '--'})</div></div>
                    <div onClick={() => set_tab('ne')} class={`${is_selected_tab('ne')? 'bg-indigo-700' : 'bg-slate-500' } select-none cursor-pointer hover:bg-indigo-800 flex-1 text-green-100 border-b-2 justify-center items-center flex flex-col px-2`}><div>Negatives </div><div>({coverage()?.N ?? '--'})</div></div>
                </div>
                <div class='flex-1 flex flex-col bg-silver-900 h-50'>
                    <div class='h-full flex-1 flex flex-col overflow-y-auto'>
                        <For each={cut_list()} fallback={
                            <div class='flex-1 flex flex-col items-center justify-center'>
                                <p class='text-slate-700 text-lg'>No Puzzles here G.</p>
                                <button onClick={save_work} class='text-lime-50 select-none cursor-pointer p-2 text-center rounded bg-green-400 hover:bg-green-500 active:bg-green-600'>Save the script to run it against puzzles</button>
                            </div>
                        }>{item =>
                            <div onClick={() => set_selected_puzzle_id(item.puzzle.id)} class={`select-none cursor-pointer p-1 flex gap-1 items-center bg-lime-100  border-b border-dashed border-cyan-300 active:bg-lime-200 ${is_selected_puzzle(item.puzzle.id) ? 'bg-lime-400': 'hover:bg-yellow-200 even:bg-yellow-100'}`}>
                                <div class=''>{item.puzzle.index}.</div>
                                <div class='p-2 text-center'>#{item.puzzle.id}</div>
                                <div class='p-2 flex-1 flex-wrap flex text-sm gap-1 max-w-50'>
                                    <For each={item.puzzle.tags.split(' ')}>{tag =>
                                        <span>{tag}</span>
                                    }</For>
                                </div>
                                <div class='flex-2'>

                                </div>
                            </div>
                        }</For>
                    </div>
                </div>

            </div>
        </div>
    </>)
}

export function ChessboardGroup() {

    const [{ worker_state: state, gofchess_state },{gofchess_actions: { set_ephemeral_code, save_work }}] = useState()

    let { puzzle_state } = gofchess_state

    const on_command = (cmd: string) => {
        if (cmd === 'write') {
            save_work()
        }
    }

    return (<>
        <div class='flex-1 flex flex-col lg:flex-row gap-0.5'>
            <div class='flex-8 flex flex-row bg-emerald-500 rounded border border-slate-500'>
                <div class='relative flex flex-1 border-r border-dashed border-slate-100'>
                    <GofEditor vim_mode={gofchess_state.vim_mode_enabled} content={gofchess_state.code} on_content={set_ephemeral_code} on_command={on_command}/>
                    <Show when={state.compile_error}>
                        <div class='absolute bottom-0 right-0 bg-red-500 text-white p-2 border-2 border-dashed rounded'>
                            Compile Error
                        </div>
                    </Show>
                </div>
                <div class='flex flex-1'>
                    <Show when={gofchess_state.visual_state.visual} fallback={<>
                        <div class='flex-col gap-5 flex-1 flex justify-center items-center'>
                            <p>Output will be shown here.</p>
                            <button onClick={save_work} class='text-lime-50 select-none cursor-pointer p-2 text-center rounded bg-green-400 hover:bg-green-500 active:bg-green-600'>Save the script to run it against puzzles</button>
                        </div>
                        </>}>{ content => 
                        <GofEditorOutput content={content()} />
                    }</Show>
                </div>
            </div>
            <div class='flex flex-col flex-3 p-2 bg-amber-400 rounded border border-slate-500'>
                <Chessboard fen={puzzle_state.fen} />
                <div class='flex-1 border-t border-violet-700 m-2 min-h-7 overflow-auto'>
                    <div class='flex flex-wrap gap-0.5'>
                        <For each={puzzle_state.solution}>{(san, i) =>
                            <div class={`leading-8 flex select-none cursor-pointer py-0.5 px-2 rounded bg-violet-500 text-orange-50 hover:bg-violet-600`}><div class='font-bold'>{index_to_ply(i(), puzzle_state.initial_turn)}</div>{san}</div>
                        }</For>
                    </div>
                </div>
            </div>

        </div>
    </>)
}


export function ChessInfoGroup() {

    let list = '1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16'.split(',')
    return (<>
        <div class='flex flex-col gap-1'>
            <div class='p-1 bg-blue-400 rounded border border-zinc-500'>
                <div> Category: <span>Bishop Forks</span> </div>
                <div> Puzzle: <span>#1</span> </div>
                <A href='https://lichess.org/'>Lichess Link</A>
                <div>Rating: 2000</div>
            </div>
            <div class='p-1 bg-blue-400 rounded border border-zinc-500'>
                <h2 class='text-xl'><A href='/'>Bishop Forks</A></h2>
                <div class='overflow-y-auto'>
                    <div class='flex flex-wrap'>
                        <For each={list}>{item =>
                            <div class='select-none cursor-pointer border border-zinc-500 py-1 px-2 m-2 text-slate-900 bg-yellow-500 hover:bg-cyan-400 rounded'>{item}</div>
                        }</For>
                    </div>
                </div>
            </div>
        </div>
    </>)
}



const index_to_ply = (i: number, color: Color) => {

    let ply = Math.ceil(i / 2) + 1
    if (color === 'black') {
        return i === 0 ? `${ply}..` : i % 2 == 1 ? `${ply}.` : ''
    } else {
        return i % 2 == 0 ? `${ply}.` : ''
    }
}