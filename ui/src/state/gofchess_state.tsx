import { createStore } from "solid-js/store"
import type { WorkerActions, WorkerState } from "./Worker"
import { makePersisted } from "@solid-primitives/storage"
import { createSignal } from "solid-js"
import type { Puzzle } from "./puzzles"
import { Chess, INITIAL_FEN, parseFen, visual_node_log, type Color, type SAN, type Visual_CompositeNestedGraphRoot } from "hopefox"
import type { FEN } from "@lichess-org/chessground/types"
import Default_Help_Script from './default_help_script.gof?raw'

export type State = {
    visual_state: VisualOutputNavigateState
    puzzle_state: PuzzleNavigateState
    vim_mode_enabled: boolean
    code: string
    selected_puzzle_id: string
}

export type Actions = {
    visual_actions: VisualOutputNavigateActions
    puzzle_actions: PuzzleNavigateActions
    set_selected_puzzle_id: (_: string) => void
    set_ephemeral_code: (code: string) => void
    save_work: () => void
    toggle_vim_mode: () => void
    reset_to_help_script: () => void
}

export type GofchessStore = [State, Actions]

export function make_gofchess_store(worker_state: WorkerState, worker_actions: WorkerActions): GofchessStore {


    let [store, set_store] = makePersisted(createStore({
        vim_mode_enabled: false,
        code: Default_Help_Script,
        selected_puzzle_id: ''
    }), { name: '.gofchess.store.v1'})
    let [ephemeral_code, set_ephemeral_code] = createSignal(store.code)

    let [visual_state, visual_actions] = createVisualOutputNavigate()

    let [puzzle_state, puzzle_actions] = createPuzzleNavigate()

    let state = {
        visual_state,
        puzzle_state,
        get vim_mode_enabled() {
            return store.vim_mode_enabled
        },
        get code() {
            return store.code
        },
        get selected_puzzle_id() {
            return store.selected_puzzle_id
        }
    }


    const set_selected_puzzle_bindings = () => {
        let selected_puzzle = worker_state.batch_in_progress_merged.partial_out
            .find(_ => _.puzzle.id === state.selected_puzzle_id)

        puzzle_actions.set_puzzle(selected_puzzle?.puzzle)
        visual_actions.set_visual(selected_puzzle?.coverage.visual)
    }

    worker_actions.add_listener_on_workout_added(set_selected_puzzle_bindings)

    let actions = {
        visual_actions,
        puzzle_actions,
        reset_to_help_script() {
            set_ephemeral_code(Default_Help_Script)
            set_store('code', ephemeral_code())
            worker_actions.reset_others_and_begin_on_code(store.code)
        },
        toggle_vim_mode() {
            set_store('vim_mode_enabled', !store.vim_mode_enabled)
        },
        set_selected_puzzle_id(id: string) {
            set_store('selected_puzzle_id', id)

            set_selected_puzzle_bindings()

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

type VisualOutputNavigateState = {
    visual: string | undefined
}

type VisualOutputNavigateActions = {
    set_visual(visual?: Visual_CompositeNestedGraphRoot): void
}

type VisualOutputNavigateStore = [VisualOutputNavigateState, VisualOutputNavigateActions]



export function createVisualOutputNavigate(): VisualOutputNavigateStore {

    let [visual, set_visual] = createSignal<Visual_CompositeNestedGraphRoot | undefined>(undefined, { equals: false})

    let state = {
        get visual() {
            let v = visual()
            if (v) {
                return visual_node_log(v)
            }
        }
    }

    let actions = {
        set_visual(visual?: Visual_CompositeNestedGraphRoot) {
            set_visual(visual)
        }
    }

    return [state, actions]
}