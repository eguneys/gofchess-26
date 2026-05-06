import { Chessboard } from "../components/Chessboard";
import { For } from "solid-js";
import { A } from "@solidjs/router";
import GofEditor from "../components/GofEditor";
import GofEditorOutput from "../components/GofEditorOutput";

export default function SolvePage() {


    return (<>
        <div class='flex gap-1 p-0.5'>
            <div class='flex-1'>
                <ChessboardGroup />
            </div>
        </div>
        <div class='flex p-0.5 gap-1'>
            <div class='flex-2'>
                <ChesslineGroup />
            </div>
            <div class='flex-1'>
                <ChessInfoGroup />
            </div>
        </div>
    </>)
}

export function ChesslineGroup() {
    const list = 'aslkdfjlskadjlksadjflksdajlfkjadslfdsla'.split('')
    const tags = ['mateIn1', 'backrankMate', 'advanced', 'long', 'short', 'medium']
    return (<>
        <div class='flex flex-col bg-silver-900 rounded border border-slate-500 h-full'>
            <div class='flex justify-around leading-3'>
                <span class='text-center flex-2 p-2 bg-pink-500 text-blue-100'>Coverage: %100</span>
                <span class='text-center flex-2 p-2 bg-pink-500 text-blue-100'>Accuracy: %100</span>
                <span class='text-center text-nowrap flex-3 p-2 bg-pink-500 text-blue-100'>Tp/Fp: 1/1 N: 99999 Total: 100000</span>
                <span class='text-center flex-2 p-2 bg-pink-500 text-blue-100'>Time per puzzle: 1ms</span>
                <span class='text-center flex-2 p-2 bg-pink-500 text-blue-100'>took 10s</span>
            </div>
            <div class='flex flex-row h-full'>
                <div class='flex flex-col'>
                    <h2 class='select-none cursor-pointer hover:bg-indigo-600 flex-1 bg-indigo-500 text-green-100 border-b-2 justify-center items-center flex'>True Positives</h2>
                    <h2 class='select-none cursor-pointer hover:bg-indigo-600 flex-1 bg-indigo-500 text-green-100 border-b-2 justify-center items-center flex'>False Positives</h2>
                    <h2 class='select-none cursor-pointer hover:bg-indigo-600 flex-1 bg-indigo-500 text-green-100 border-b-2 justify-center items-center flex'>Negatives</h2>
                </div>
                <div class='flex-1 flex bg-silver-900 h-50'>
                    <div class='flex-1 flex flex-col overflow-auto'>
                        <For each={list}>{() =>
                            <div class='select-none cursor-pointer p-1 flex gap-1 items-center bg-lime-100 even:bg-yellow-100 border-b border-dashed border-cyan-300 hover:bg-yellow-200 active:bg-lime-200'>
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
        <div class='flex flex-col lg:flex-row gap-0.5'>
            <div class='flex-8 flex flex-row bg-emerald-500 rounded border border-slate-500 lg:min-h-100 min-h-140'>
                <div class='flex-1 border-r border-dashed border-slate-100'>
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

