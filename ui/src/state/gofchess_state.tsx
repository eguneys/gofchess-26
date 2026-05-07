import { createStore } from "solid-js/store"
import type { WorkerActions, WorkerState } from "./Worker"
import { makePersisted } from "@solid-primitives/storage"
import { batch, createSignal } from "solid-js"
import type { Puzzle } from "./puzzles"
import { Chess, INITIAL_FEN, parseFen, type Color, type SAN } from "hopefox"
import type { FEN } from "@lichess-org/chessground/types"

export type State = {
    puzzle_state: PuzzleNavigateState
    code: string
    selected_puzzle_id: string
}

export type Actions = {
    puzzle_actions: PuzzleNavigateActions
    set_selected_puzzle_id: (_: string) => void
    set_ephemeral_code: (code: string) => void
    save_work: () => void
}

export type GofchessStore = [State, Actions]

export function make_gofchess_store(worker_state: WorkerState, worker_actions: WorkerActions): GofchessStore {

    let [ephemeral_code, set_ephemeral_code] = createSignal('')

    let [store, set_store] = makePersisted(createStore({
        code: '',
        selected_puzzle_id: ''
    }), { name: '.gofchess.store.v1'})

    let [puzzle_state, puzzle_actions] = createPuzzleNavigate()

    let state = {
        puzzle_state,
        get code() {
            return store.code
        },
        get selected_puzzle_id() {
            return store.selected_puzzle_id
        }
    }


    let actions = {
        puzzle_actions,
        set_selected_puzzle_id(id: string) {
            set_store('selected_puzzle_id', id)

            let selected_puzzle = worker_state.batch_in_progress_merged.partial_out
                .find(_ => _.puzzle.id === id)?.puzzle

            puzzle_actions.set_puzzle(selected_puzzle)


        },
        set_ephemeral_code(code: string) {
            set_ephemeral_code(code)
        },
        save_work() {
            set_store('code', ephemeral_code())
            worker_actions.reset_others_and_begin_on_code(store.code)
        }
    }

    return [state, actions]
}


type PuzzleNavigateState = {
    puzzle: Puzzle | undefined
    solution: SAN[]
    fen: FEN
    initial_turn: Color
}

type PuzzleNavigateActions = {
    set_puzzle(puzzle?: Puzzle): void
}

type PuzzleNavigateStore = [PuzzleNavigateState, PuzzleNavigateActions]

export function createPuzzleNavigate(): PuzzleNavigateStore {

    let [puzzle, set_puzzle] = createSignal<Puzzle | undefined>(undefined, { equals: false})

    let state = {
        get initial_turn() {
            let p = puzzle()
            if (!p) {
                return 'white'
            }
            return Chess.fromSetup(parseFen(p.fen).unwrap()).unwrap().turn
        },
        get puzzle() {
            return puzzle()
        },
        get solution() {
            return puzzle()?.sans ?? []
        },
        get fen() {
            return puzzle()?.move_fens[0] ?? INITIAL_FEN
        }
    }

    let actions = {
        set_puzzle(puzzle: Puzzle) {
            set_puzzle(puzzle)
        }

    }

    return [state, actions]

}