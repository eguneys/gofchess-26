import Worker from './worker2?worker'
import { CoverageResult, type BatchWorkContinuationOut, type BatchWorkOut } from './worker_types'
import { batch, createSignal } from 'solid-js'
import { createStore, produce } from 'solid-js/store'

export type FullCoverage = {
    Tp: number
    Fp: number
    N: number
    percent: number
    accuracy: number
    Total: number
}

export type RunningTimes = {
    per_puzzle_ms: number
    total_seconds: number
}

export type BatchInProgressMerged = {
    total: number
    partial_out: BatchWorkOut[],
    running_coverage?: FullCoverage
    running_times?: RunningTimes
    progress_percent: number
}

export type WorkerState = {
    is_ready: boolean
    batch_in_progress_merged: BatchInProgressMerged
    compile_error: boolean
}

export type WorkerActions = {
    reset_others_and_begin_on_code(code: string): void
    add_listener_on_workout_added(cb: () => void): void
}

type WorkerStore = [WorkerState, WorkerActions]

export function make_worker(): WorkerStore {
    let worker = new Worker()

    let workout_listeners: (() => void)[] = []
    let [consumer, { add_workout, reset_work: consumer_reset_work }] = createBatchConsumer()

    const [compile_error, set_compile_error] = createSignal(false)

    worker.onmessage = (e) => {
        if (e.data === 'ready') {
            set_isReady(true)
        } else if (e.data?.t === 'work_out') {
            add_workout(e.data.work_out)
            workout_listeners.forEach(l => l())
        } else if (e.data?.t === 'compile_error') {
            set_compile_error(true)
        } else if (e.data?.t === 'ack_work_in') {
            consumer_reset_work()
        }
    }

    let [isReady, set_isReady] = createSignal(false)

    const reset_work = (code: string) => {
        if (!isReady()) {
            return
        }
        set_compile_error(false)
        worker.postMessage({ t: 'work_in', work_in: { code } })
    }

    let state = {
        get is_ready() {
            return isReady()
        },
        get batch_in_progress_merged() {
            return consumer.batch_in_progress_merged
        },
        get compile_error() {
            return compile_error()
        }
    }

    let actions = {
        reset_others_and_begin_on_code(code: string) {
            reset_work(code)
        },
        add_listener_on_workout_added(cb: () => void) {
            workout_listeners.push(cb)
        }
    }


    return [state, actions]
}


type BatchConsumerState = {
    batch_in_progress_merged: BatchInProgressMerged
}

type BatchConsumerActions = {
    reset_work(): void 
    add_workout(work_out: BatchWorkContinuationOut): void
}

type BatchConsumer = [BatchConsumerState, BatchConsumerActions]

function createBatchConsumer(): BatchConsumer {

    let start_time = 0

    let [batch_in_progress_merged, set_batch_in_progress_merged] = createStore<BatchInProgressMerged>({
        total: 0,
        partial_out: [],
        running_coverage: undefined,
        running_times: undefined,
        progress_percent: 0
    })

    const update_batch_in_progress_merged = (batch: BatchWorkContinuationOut, elapsed_ms: number) => {
        let total = batch.total
        set_batch_in_progress_merged('total', total)

        set_batch_in_progress_merged(
            produce((s) => {
                s.partial_out.push(...batch.partial_out)
            })
        )

        let total_so_far = batch_in_progress_merged.partial_out.length
        set_batch_in_progress_merged('progress_percent', total_so_far / total * 100)

        if (batch_in_progress_merged.running_coverage === undefined) {
            let running_coverage: FullCoverage = {
                Tp: 0,
                Fp: 0,
                N: 0,
                get percent() {
                    return (this.Tp + this.Fp) / this.Total * 100
                },
                get accuracy() {
                    return this.Tp / (this.Tp + this.Fp) *  100
                },
                get Total() {
                    return this.Tp + this.Fp + this.N
                }
            }
            set_batch_in_progress_merged('running_coverage', running_coverage)
        }

        let Total_Tp = 0
        let Total_Fp = 0
        let Total_N = 0

        for (let po of batch.partial_out) {
            switch (po.coverage.result) {
                case CoverageResult.Tp:
                    Total_Tp++
                    break
                case CoverageResult.Fp:
                    Total_Fp++
                    break
                case CoverageResult.N:
                    Total_N++
                    break
            }
        }

        set_batch_in_progress_merged('running_coverage', 'Tp', _ => _ + Total_Tp)
        set_batch_in_progress_merged('running_coverage', 'Fp', _ => _ + Total_Fp)
        set_batch_in_progress_merged('running_coverage', 'N', _ => _ + Total_N)


        let running_times: RunningTimes = {
            per_puzzle_ms: elapsed_ms / batch_in_progress_merged.partial_out.length,
            total_seconds: elapsed_ms / 1000,
        }

        set_batch_in_progress_merged('running_times', running_times)
    }

    let actions = {
        reset_work() {
            start_time = performance.now()
            set_batch_in_progress_merged({
                total: 0,
                partial_out: [],
                running_coverage: undefined,
                running_times: undefined,
                progress_percent: 0
            })
        },
        add_workout(work_out: BatchWorkContinuationOut) {
            let elapsed_ms = performance.now() -  start_time
            batch(() => {
                update_batch_in_progress_merged(work_out, elapsed_ms)
            })
        }
    }

    let state = {
        get batch_in_progress_merged() {
            return batch_in_progress_merged
        }
    }

    return [state, actions]
}