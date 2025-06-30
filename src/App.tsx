import { BrowserRouter} from "react-router-dom";
import Header from "./Components/Navigation/Header/Header";
import Router from "./Components/Navigation/Router/Router";


function App() {
    

    return (
        <BrowserRouter>
            <Header />
            <Router />
        </BrowserRouter>
    )
}

export default App
