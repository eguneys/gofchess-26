import wasm_url from '../assets/wasm/hopefox.wasm?url'
import { PositionManager } from "hopefox";
import { parse_puzzles } from './puzzles';
import { PuzzleBatchWorker  } from './worker_types';

const tenk = '/data/tenk_puzzle.csv'

const fetch_puzzles = async (tenk: string) => fetch(tenk).then(_ => _.text()).then(tenk => parse_puzzles(tenk))

let batch_worker: PuzzleBatchWorker

const init = async() => {
    let m = await PositionManager.make(() => wasm_url)
    let all = await fetch_puzzles(tenk)
    batch_worker = new PuzzleBatchWorker(m, all)

    batch_begin_work_loop()

    postMessage('ready')
}
init()

function batch_begin_work_loop() {

    let work_out = batch_worker.step_work()
    if (work_out) {
        postMessage({ t: 'work_out', work_out })
    }

    setTimeout(batch_begin_work_loop)
}

onmessage = (e) => {
    if (e.data.t === 'work_in') {
        batch_worker.begin_work(e.data.work_in)
        postMessage({ t: 'ack_work_in' })
    }
}