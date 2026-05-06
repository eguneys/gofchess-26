import { A, Route, Router } from "@solidjs/router"
import { type JSX, lazy } from "solid-js"

const SolvePage = lazy(() => import("./routes/SolvePage"))

const Layout = (props: { children?: JSX.Element }) => {
  return (
  <>
    <header class='flex justify-content items-center h-10 bg-gray-200'><A href='/'><div class='px-2 text-xl'>gofchess<span class='text-gray-500'>.com</span></div></A></header>
    <div class='bg-zinc-300'>
      {props.children}
    </div>
  </>
  )
}

function App() {
  return (<>
    <Router root={Layout}>
      <Route path='/' component={SolvePage}/>
    </Router>
  </>)
}

export default App
