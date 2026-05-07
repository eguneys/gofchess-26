import { A, Route, Router } from "@solidjs/router"
import { type JSX, lazy } from "solid-js"
import { GofchessProvider } from "./state/State"

const SolvePage = lazy(() => import("./routes/SolvePage"))

const Layout = (props: { children?: JSX.Element }) => {
  return (
  <>
      <div class='flex flex-col min-h-screen'>
        <header class='flex justify-content items-center h-10 bg-gray-200'><A href='/'><div class='px-2 text-xl'>gofchess<span class='text-gray-500'>.com</span></div></A></header>
        <div class='flex flex-col bg-zinc-300 flex-1'>
          {props.children}
        </div>
      </div>
  </>
  )
}

function App() {
  return (<>
    <GofchessProvider>
      <Router root={Layout}>
        <Route path='/' component={SolvePage} />
      </Router>
    </GofchessProvider>
  </>)
}

export default App
