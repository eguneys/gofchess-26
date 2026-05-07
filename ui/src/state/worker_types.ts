import { PositionManager, usage, type PositionC, type Visual_CompositeNestedGraphRoot } from "hopefox"
import type { Puzzle } from "./puzzles"
export enum CoverageResult {
    Tp,
    Fp,
    N
}

export type PartialCoverage = { 
    result: CoverageResult
    visual: Visual_CompositeNestedGraphRoot
}

export type BatchWorkOut = {
    puzzle: Puzzle
    coverage: PartialCoverage
}

export type BatchWorkIn = {
    code: string
}

export type BatchWorkContinuationOut = {
    total: number
    partial_out: BatchWorkOut[]
    is_ended: boolean
}

export type CompiledFn = (m: PositionManager, pos: PositionC) => Visual_CompositeNestedGraphRoot

export type ResumableBatch = {
    work_in: BatchWorkIn
    compiled_fn: CompiledFn
    resume_index: number
}

export class PuzzleBatchWorker {

    batch_size = 10
    id_gen = 1

    resumable_existing_batches: ResumableBatch | undefined

    constructor(private m: PositionManager, private puzzles: Puzzle[]) {}

    begin_work(work_in: BatchWorkIn) {
        this.resumable_existing_batches = { 
            resume_index: 0,
            compiled_fn: usage(work_in.code),
            work_in
        }
    }

    cancel_work() {
        this.resumable_existing_batches = undefined
    }

    step_work(): BatchWorkContinuationOut | undefined {
        let batch = this.resumable_existing_batches

        if (batch) {

            this.resumable_existing_batches = undefined

            let res = this.do_work(batch)

            if (!res.end_index) {
                return {
                    total: this.puzzles.length,
                    partial_out: res.partial_out,
                    is_ended: true
                }
            } else {

                this.resumable_existing_batches = {
                    resume_index: res.end_index,
                    work_in: batch.work_in,
                    compiled_fn: batch.compiled_fn
                }

                return {
                    total: this.puzzles.length,
                    partial_out: res.partial_out,
                    is_ended: false
                }
            }
        }
    }

    private do_work(batch: ResumableBatch) {

        let resume_index = batch.resume_index
        let partial_out = []

        let end_index = Math.min(this.puzzles.length, resume_index + this.batch_size)

        const now = performance.now()
        for (let i = resume_index; i < end_index; i++) {
            partial_out.push(do_work_in_puzzle(this.m, this.puzzles[i], batch.compiled_fn))
        }
        let elapsed_ms = performance.now() - now

        let per_puzzle_ms = elapsed_ms / (end_index - resume_index)

        this.batch_size = Math.floor(1000 / per_puzzle_ms)

        if (end_index === this.puzzles.length) {
            return {
                partial_out
            }
        }
        return {
            partial_out,
            end_index
        }
    }
}

function do_work_in_puzzle(m: PositionManager, puzzle: Puzzle, compiled_fn: CompiledFn): BatchWorkOut {
    let pos = m.create_position(puzzle.move_fens[0])
    let visual = compiled_fn(m, pos)

    let result = compare_coverage_result(visual, puzzle.sans)

    let coverage: PartialCoverage = {
        result,
        visual
    }
    return { puzzle, coverage }
}


function compare_coverage_result(visual: Visual_CompositeNestedGraphRoot, sans: string[]) {
    visual;
    sans;
    return CoverageResult.Fp
}