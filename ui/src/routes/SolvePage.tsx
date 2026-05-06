import { Chessboard } from "../components/Chessboard";
import { createMemo, createSelector, createSignal, For, Show } from "solid-js";
import { A } from "@solidjs/router";
import GofEditor from "../components/GofEditor";
import GofEditorOutput from "../components/GofEditorOutput";

export default function SolvePage() {


    return (<>
        <div class='flex-1 flex gap-1 p-0.5'>
            <div class='flex flex-1'>
                <ChessboardGroup />
            </div>
        </div>
        <div class='flex-1 flex p-0.5 gap-1'>
            <div class='flex-2'>
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

    const list = 'aslkdfjlskadjlksadjflksdajlfkjadslfdsla'.split('').map(_ => ({
        id: _
    }))

    const tags = ['mateIn1', 'backrankMate', 'advanced', 'long', 'short', 'medium']

    const [tab, set_tab] = createSignal<Tab>('tp')

    const is_selected_tab = createSelector(tab)

    const coverage = createMemo(() => ({
        percent: 50,
        accuracy: 100,
        Tp: 1,
        Fp: 1000,
        N: 10000,
        Total: 10000
    }))

    const running_times = createMemo(() => ({
        per_puzzle_ms: 1,
        total_seconds: 10
    }))

    const selected_puzzle_id = createMemo(() => 'a')

    const is_selected_puzzle = createSelector(selected_puzzle_id)

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
                        <span class='text-center flex-2 p-2 bg-pink-500 text-blue-100'>Coverage: %{coverage().percent}</span>
                        <span class='text-center flex-2 p-2 bg-pink-500 text-blue-100'>Accuracy: %{coverage().accuracy}</span>
                        <span class='text-center text-nowrap flex-3 p-2 bg-pink-500 text-blue-100'>Tp/Fp: {coverage().Tp}/{coverage().Fp} N: {coverage().N} Total: {coverage().Total}</span>
                    </>
                }</Show>

                <Show when={running_times()} fallback={
                    <>
                    </>
                }>{times =>
                        <>
                            <span class='text-center flex-2 p-2 bg-pink-500 text-blue-100'>Time per puzzle: {times().per_puzzle_ms}ms</span>
                            <span class='text-center flex-2 p-2 bg-pink-500 text-blue-100'>took {times().total_seconds}s</span>
                        </>
                    }</Show>
            </div>
            <div class='flex flex-row h-full'>
                <div class='flex flex-col'>
                    <div onClick={() => set_tab('tp')} class={`${is_selected_tab('tp') ? 'bg-indigo-700' : 'bg-slate-500'} select-none cursor-pointer hover:bg-indigo-800 flex-1 text-green-100 border-b-2 justify-center items-center flex flex-col px-2`}><div>True Positives</div> <div>({coverage().Tp})</div></div>
                    <div onClick={() => set_tab('fp')} class={`${is_selected_tab('fp')? 'bg-indigo-700' : 'bg-slate-500' } select-none cursor-pointer hover:bg-indigo-800 flex-1 text-green-100 border-b-2 justify-center items-center flex flex-col px-2`}><div>False Positives </div><div>({coverage().Fp})</div></div>
                    <div onClick={() => set_tab('ne')} class={`${is_selected_tab('ne')? 'bg-indigo-700' : 'bg-slate-500' } select-none cursor-pointer hover:bg-indigo-800 flex-1 text-green-100 border-b-2 justify-center items-center flex flex-col px-2`}><div>Negatives </div><div>({coverage().N})</div></div>
                </div>
                <div class='flex-1 flex bg-silver-900 h-50'>
                    <div class='flex-1 flex flex-col overflow-auto'>
                        <For each={list}>{item =>
                            <div class={`select-none cursor-pointer p-1 flex gap-1 items-center bg-lime-100 even:bg-yellow-100 border-b border-dashed border-cyan-300 hover:bg-yellow-200 active:bg-lime-200 ${is_selected_puzzle(item.id) ? 'bg-lime-400': ''}`}>
                                <div class=''>1.</div>
                                <div class='p-2 text-center'>#00008</div>
                                <div class='p-2 flex-1 flex-wrap flex text-sm gap-1 max-w-50'>
                                    <For each={tags}>{tag =>
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
    return (<>
        <div class='flex-1 flex flex-col lg:flex-row gap-0.5'>
            <div class='flex-8 flex flex-row bg-emerald-500 rounded border border-slate-500'>
                <div class='flex flex-1 border-r border-dashed border-slate-100'>
                    <GofEditor/>
                </div>
                <div class='flex-1'>
                    <GofEditorOutput/>
                </div>
            </div>
            <div class='flex-3 p-2 bg-amber-400 rounded border border-slate-500'>
                <Chessboard fen="" />
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

