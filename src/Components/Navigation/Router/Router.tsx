import { Navigate, Route, Routes } from "react-router-dom";
import Vacations from "../../pages/Vacations/Vacations";
import NotFound from "../../pages/NotFound/NotFound";
import AddVacation from "../../pages/AddVacation/AddVacation";
import LoginView from "../../Auth/LoginView/LoginView";
import RegisterView from "../../Auth/RegisterView/RegisterView";
import Reports from "../../pages/Reports/Reports";
import { useSelector } from "react-redux";
import type { RootState } from "../../../Data/ReduxModule";

function Router() {
    const isAuth = useSelector((state: RootState) => state).auth;    
    return (
        <Routes>
            <Route path="/" element={isAuth?<Vacations />:<RegisterView/>} />
            <Route path="/vacations" element={isAuth?<Vacations />:<Navigate to="/register" replace />} />
            <Route path="/add" element={<AddVacation />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/login" element={<LoginView />} />
            <Route path="/register" element={<RegisterView />} />
            <Route path="/*" element={<NotFound />} />
        </Routes>
    )
}

export default Router
