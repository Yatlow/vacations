import { NavLink, useNavigate } from "react-router-dom";
import { setClass, setMsg, type AppDispatch, type RootState } from "../../../Data/ReduxModule";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";
import { logout } from "../../../Services/logout";
import config from "../../../../config/config.json"
import loading from "../../../assets/images/loading.png";
import hamburger from "../../../assets/images/hamburger.png";

function Header() {
    const [menuState, setMenuState] = useState(false)
    const { auth, msg, modalClass } = useSelector((state: RootState) => state)
    const timeoutRef = useRef<number | null>(null);
    const lastMoved = useRef(Date.now());

    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const stored = localStorage.getItem("loginData");
    const loginData = stored ? JSON.parse(stored) : "";
    const role = loginData.role;

    const resetTimer = () => {
        const loginData = localStorage.getItem("loginData");
        if (!loginData) return;
        lastMoved.current = Date.now();
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            if (loginData) {
                dispatch(setClass("loggingOutModal"));
                dispatch(setMsg(`User inactive.. logging out`));
                setTimeout(() => {
                    logout(navigate, dispatch);
                }, 2000)
            }
        }, config.uiTimeConfig.logOutInactive);
    };


    useEffect(() => {
        window.addEventListener("click", resetTimer);
        window.addEventListener("mousemove", resetTimer);
        window.addEventListener("keypress", resetTimer);
        resetTimer();
    }, [auth]);

    return (
        <>
            {auth && <div className={modalClass}>
                <img src={loading} />
                <a>{msg}</a>
            </div>}
            <div className={`menu ${!stored && "notLoggedMenu"}`}>
                <div className="hamburgerBox">
                    {stored &&
                        <>
                            <div className="hamburger" onClick={() => setMenuState(!menuState)}><img src={hamburger} /></div>
                            <div className="userName">🙍‍♂️ welcome {loginData.firstName} {loginData.familyName}</div>
                            <div className="navHome" onClick={() => { if (menuState) setMenuState(!menuState) }}><NavLink to={'/vacations'}>🏡 Home</NavLink></div>
                        </>}
                    {!stored && <div className="navBtn"><NavLink to={'/login'} className={({ isActive }) => (isActive ? "activeLink" : "")}>Login</NavLink></div>}
                    {!stored && <div className="navBtn"><NavLink to={'/register'} className={({ isActive }) => (isActive ? "activeLink" : "")}>Register</NavLink></div>}
                </div>
                <nav className={menuState ? "header" : "hiddenHeder"}>
                    {role && <NavLink to={'/vacations'} onClick={() => setMenuState(!menuState)} className={({ isActive }) => (isActive ? "activeLink" : "")}>Vacations</NavLink>}
                    {role === "admin" && <NavLink to={'/add'} onClick={() => setMenuState(!menuState)} className={({ isActive }) => (isActive ? "activeLink" : "")}>Add Vacation</NavLink>}
                    {role === "admin" && <NavLink to={'/reports'} onClick={() => setMenuState(!menuState)} className={({ isActive }) => (isActive ? "activeLink" : "")}>Reports</NavLink>}
                    {role && <a onClick={() => { logout(navigate, dispatch); setMenuState(!menuState) }} className="logout">logout </a>}
                </nav>
            </div>
        </>
    )
}

export default Header
