import { createContext, type JSX, useContext } from "solid-js"
import { make_gofchess_store, type Actions, type State } from "./gofchess_state"
import { make_worker, type WorkerActions, type WorkerState } from "./Worker"

export const useState = () => useContext(GofchessContext)!

const GofchessContext = createContext<GofchessStore>()

type GofchessState = {
    gofchess_state: State
    worker_state: WorkerState
}

type GofchessActions = {
    gofchess_actions: Actions
    worker_actions: WorkerActions
}

export type GofchessStore = [GofchessState, GofchessActions]



export const GofchessProvider = (props: { children: JSX.Element }) => {

    const [worker_state, worker_actions] = make_worker()
    const [gofchess_state, gofchess_actions] = make_gofchess_store(worker_state, worker_actions)


    const state = {
        gofchess_state,
        worker_state
    }

    const actions = {
        gofchess_actions,
        worker_actions
    }

    const store: GofchessStore = [state, actions]

    return <GofchessContext.Provider value={store}>
        {props.children}
    </GofchessContext.Provider>
}