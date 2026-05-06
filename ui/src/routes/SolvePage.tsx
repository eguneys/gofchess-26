import { Chessboard } from "../components/Chessboard";
import { For } from "solid-js";
import Chessline from "../components/Chessline";
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
        <div class='flex'>
            <div class='flex-1'>
                <ChesslineGroup />
                <ChessInfoGroup />
            </div>
        </div>
    </>)
}

export function ChesslineGroup() {
    return (<>
        <div class='p-2 bg-amber-400 rounded border border-slate-700 min-h-70'>
            <Chessline />
        </div>
    </>)
}

export function ChessboardGroup() {
    return (<>
        <div class='flex flex-col lg:flex-row gap-0.5'>
            <div class='flex-8 flex flex-row bg-emerald-500 rounded border border-slate-700 lg:min-h-100 min-h-140'>
                <div class='flex-1 border-r border-cyan-400'>
                    <GofEditor/>
                </div>
                <div class='flex-1'>
                    <GofEditorOutput/>
                </div>
            </div>
            <div class='flex-3 p-2 bg-amber-400 rounded border border-slate-700'>
                <Chessboard fen="" />
            </div>

        </div>
    </>)
}


export function ChessInfoGroup() {

    let list = '1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16'.split(',')
    return (<>
        <div class='flex flex-col gap-1'>
            <div class='p-1 bg-blue-400 rounded border border-zinc-700'>
                <div> Category: <span>Bishop Forks</span> </div>
                <div> Puzzle: <span>#1</span> </div>
                <A href='https://lichess.org/'>Lichess Link</A>
                <div>Rating: 2000</div>
            </div>
            <div class='p-1 bg-blue-400 rounded border border-zinc-700'>
                <h2 class='text-xl'><A href='/'>Bishop Forks</A></h2>
                <div class='overflow-y-auto'>
                    <div class='flex flex-wrap'>
                        <For each={list}>{item =>
                            <div class='select-none cursor-pointer border border-zinc-700 py-1 px-2 m-2 text-slate-900 bg-yellow-500 hover:bg-cyan-400 rounded'>{item}</div>
                        }</For>
                    </div>
                </div>
            </div>
        </div>
    </>)
}

