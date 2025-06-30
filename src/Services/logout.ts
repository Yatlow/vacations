import { setAuth, setClass } from "../Data/ReduxModule";
import config from '../../config/config.json';

export function logout(navigate: Function, dispatch: Function) {
    localStorage.removeItem("loginData");
    localStorage.removeItem("trackedData");
    dispatch(setClass("loggingOutModal"));
    setTimeout(() => {
        dispatch(setClass("hiddenLoggingOutModal"))
        navigate("/login");
        dispatch(setAuth(false));
    }, config.uiTimeConfig.logoutMs);
};