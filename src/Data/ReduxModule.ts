import {type Action, combineReducers, createStore } from 'redux';
import {jwtDecode} from "jwt-decode";

const stored = localStorage.getItem("loginData");
let parsedToken: any = null;
let isAuth = false;

if (stored) {
    try {
        const parsed = JSON.parse(stored);
        parsedToken = parsed.token;

        const decoded: { exp: number } = jwtDecode(parsedToken);
        const now = Date.now() / 1000;
        

        if (decoded.exp > now) {
            isAuth = true;
        } else {
            localStorage.removeItem("loginData"); 
        }
    } catch (err) {
        localStorage.removeItem("loginData");
    }
}


const initialState = isAuth;
const initialMsgState = "logging out...";
const initialModalClass = "hiddenLoggingOutModal";

interface authPayload{
    isAuth:boolean;
    logOutMessage:string;
    modalClass:string;
}

interface AuthAction extends Action {
    type: "SET_AUTH";
    payload: authPayload;
};
interface MsgAction extends Action {
    type: "SET_MSG";
    payload: authPayload;
};
interface ClassAction extends Action {
    type: "SET_CLASS";
    payload: authPayload;
};


const auth = (state = initialState, action: AuthAction): boolean => {
    switch (action.type) {
        case "SET_AUTH":
            return action.payload.isAuth;
        default:
            return state;
    }
};
const msg = (state = initialMsgState, action: MsgAction): string => {
    switch (action.type) {
        case "SET_MSG":
            return action.payload.logOutMessage;
        default:
            return state;
    }
};
const modalClass = (state = initialModalClass, action: ClassAction): string => {
    switch (action.type) {
        case "SET_CLASS":
            return action.payload.modalClass;
        default:
            return state;
    }
};
const rootReducer = combineReducers({
    auth,
    msg,
    modalClass,
});
const store = createStore(rootReducer);

export const setAuth = (auth: boolean): AuthAction => ({
    type: "SET_AUTH",
    payload: {isAuth:auth,logOutMessage:store.getState().msg,modalClass:store.getState().modalClass}
});
export const setMsg = (msg: string): MsgAction => ({
    type: "SET_MSG",
    payload: {isAuth:store.getState().auth,logOutMessage:msg,modalClass:store.getState().modalClass}
});
export const setClass = (modalClass: string): ClassAction => ({
    type: "SET_CLASS",
    payload: {isAuth:store.getState().auth,logOutMessage:store.getState().msg,modalClass:modalClass}
});



export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
