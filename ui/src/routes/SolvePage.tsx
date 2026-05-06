import { A } from "@solidjs/router";
import { Chessboard } from "../components/Chessboard";
import { For } from "solid-js";
import Chessline from "../components/Chessline";

export default function SolvePage() {


    return (<>
    <div class='flex flex-col lg:flex-row gap-1 p-1'>
        <div class='flex-2'>
            <ChessInfoGroup/>
        </div>
        <div class='flex-1'>
            <ChesslineGroup/>
        </div>
        <div class='flex-2'>
            <ChessboardGroup/>
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
                            <div class='select-none cursor-pointer border border-zinc-700 py-1 px-2 m-2 text-slate-900 bg-yellow-500 hover:bg-cyan-400 rounded-lg'>{item}</div>
                        }</For>
                    </div>
                </div>
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
        <div class='p-2 bg-amber-400 rounded-lg border border-slate-700'>
            <Chessboard fen="" />
        </div>
    </>)
}
