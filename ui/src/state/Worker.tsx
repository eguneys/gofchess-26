import { createAsync } from '@solidjs/router'
import Worker from './worker2?worker'
import { CoverageResult, type BatchWorkContinuationOut, type BatchWorkOut } from './worker_types'
import { batch } from 'solid-js'
import { createStore } from 'solid-js/store'

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
}

export type WorkerActions = {
    reset_others_and_begin_on_code(code: string): void
}

export function make_worker() {
    let worker = new Worker()

    let [consumer, { add_workout, reset_work: consumer_reset_work }] = createBatchConsumer()

    worker.onmessage = (e) => {
        if (e.data === 'work_out') {
            add_workout(e.data.work_out)
        }
    }

    let isReady = createAsync(() => new Promise<boolean>(resolve => {
        worker.onmessage = (e) => {
            if (e.data === 'ready') {
                resolve(true)
            }
        }
    }), { initialValue: false })

    worker.onmessage = (e) => {
        if (e.data?.t === 'ack_work_in') {
            consumer_reset_work()
        }
    }

    const reset_work = (code: string) => {
        worker.postMessage({ t: 'work_in', work_in: { code } })
    }

    let state = {
        get is_ready() {
            return isReady()
        },
        get batch_in_progress_merged() {
            return consumer.batch_in_progress_merged
        }
    }

    let actions = {
        reset_others_and_begin_on_code(code: string) {
            reset_work(code)
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

    const update_batch_in_progress_merged = (po: BatchWorkOut, total: number, elapsed_ms: number) => {
        set_batch_in_progress_merged('total', total)

        set_batch_in_progress_merged('partial_out', _ => [..._, po])

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
        switch (po.coverage.result) {
            case CoverageResult.Tp:
                set_batch_in_progress_merged('running_coverage', 'Tp', _ => _ + 1)
                break
            case CoverageResult.Fp:
                set_batch_in_progress_merged('running_coverage', 'Fp', _ => _ + 1)
                break
            case CoverageResult.N:
                set_batch_in_progress_merged('running_coverage', 'N', _ => _ + 1)
                break
        }


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
                for (let po of work_out.partial_out) {
                    update_batch_in_progress_merged(po, work_out.total, elapsed_ms)
                }
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