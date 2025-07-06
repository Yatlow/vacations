import { setAuth, setClass } from "../Data/ReduxModule";
import config from '../../config/config.json';
import { imageCache } from "../Data/imageCache";

export function logout(navigate: Function, dispatch: Function) {
    localStorage.removeItem("loginData");
    localStorage.removeItem("trackedData");
    Object.values(imageCache).forEach(URL.revokeObjectURL);
    Object.keys(imageCache).forEach(key => delete imageCache[key]);
    dispatch(setClass("loggingOutModal"));
    setTimeout(() => {
        dispatch(setClass("hiddenLoggingOutModal"))
        navigate("/login");
        dispatch(setAuth(false));
    }, config.uiTimeConfig.logoutMs);
};