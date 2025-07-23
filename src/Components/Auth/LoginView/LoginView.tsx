
import axios from "axios";
import { useForm } from "react-hook-form";
import { useRef, useState } from "react";
import config from "../../../../config/config.json";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../../Data/ReduxModule";
import { setAuth } from "../../../Data/ReduxModule";
import { useNavigate } from "react-router-dom";
import { showPass } from "../../../Services/showPass"

interface Credentials {
    email: string;
    password: string;
}
interface ResetPass {
    password: string;
}

function LoginView() {
    const {register: loginRegister, handleSubmit: loginSubmit,formState: { errors: loginErrors }} = useForm<Credentials>();
    const {register: resetRegister,handleSubmit: resetSubmit,formState: { errors: resetErrors }} = useForm<ResetPass>();

    const [state, setState] = useState({
        err: "",
        passInputType: "password",
        resetPassModal: false,
        submittedEmail: false,
        validOtp: false,
        email: "",
        otpErr: "",
        otp: [] as string[],
        uid:"",
        emailResetMsg:""
    });
    const inputRefs = useRef<HTMLInputElement[]>([]);
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();




    async function login(credentials: Credentials) {
        try {
            const route = `${config.server.url}${config.server.port}/auth/login`;
            const login = await axios.post(route, credentials)
            localStorage.setItem("loginData", JSON.stringify(login.data));
            navigate("/vacations");
            dispatch(setAuth(true));
        } catch (error: any) {
            console.log(error)
            if (error.response.data)
                setState(prev => ({ ...prev, err: error.response.data }));
            else setState(prev => ({ ...prev, err: error.message }));
        }
    };

    async function sendOTP() {
        event?.preventDefault()
        try {
            const route = `${config.server.url}${config.server.port}/auth/reset_password`;
            await axios.post(route, { email: state.email.toLowerCase() });

            inputRefs.current.forEach((input) => {
                if (input) input.value = "";
            });

            inputRefs.current[0]?.focus();

            setState(prev => ({ ...prev, submittedEmail: true, otpErr: "", otp: [] }))
        } catch (error: any) {
            let msg = "";
            if (error.response.data) msg = error.response.data
            else msg = error.msg
            console.log(msg)
            setState(prev => ({ ...prev, otpErr: msg }))
        }
    };

    async function ValidateOtp(inputVal: string, i: number) {
        const newOtp = [...state.otp];
        if (inputVal && i < 4) {
            inputRefs.current[i + 1]?.focus();
            newOtp.splice(i, newOtp.length - 1)
        }
        newOtp[i] = inputVal;
        setState(prev => ({ ...prev, otp: newOtp }))
        if (newOtp.length < 5) return
        try {
            const route = `${config.server.url}${config.server.port}/auth/validate_otp`;
            const response= await axios.post<string>(route, { otp: newOtp.join(""), email: state.email });
            setState(prev => ({ ...prev, validOtp: true,uid:response.data}))
        } catch (error: any) {
            let msg = "";
            if (error.response.data) msg = error.response.data
            else msg = error.msg
            console.log(msg)
            setState(prev => ({ ...prev, otpErr: msg }))
        }
    }

    async function setNewPass(password: ResetPass) {
        const body={email:state.email,password:password.password,uid:state.uid}

        try {
            const route = `${config.server.url}${config.server.port}/auth/set_new_password`;
            const res= await axios.post(route, body)
            if (res.data.res.affectedRows>0){
                state.emailResetMsg="Successfully Changed Password!";
                setState(prev => ({ ...prev, validOtp:false,uid:""}));
            } 
        } catch (error: any) {
            console.log(error)
            if (error.response.data)
                setState(prev => ({ ...prev, err: error.response.data,uid:""}));
            else setState(prev => ({ ...prev, err: error.message,uid:""}));
        }
    }

    return (
        <div>
            <div className="authView">
                <h1>User login</h1>
                {state.err && <p className="loginErr">{state.err}</p>}
                <form onSubmit={loginSubmit(login)}>
                    <div>
                        <label>Email:</label>
                        <input placeholder="Email" type="email" {...loginRegister("email", { required: true })} onChange={(e) => setState(prev => ({ ...prev, email: e.target.value }))} />
                        {loginErrors.email?.type === "required" && <span>Email is required</span>}
                    </div>
                    <div>
                        <label>Password:</label>
                        <div className="passwordWrapper">
                            <input placeholder="Password" type={state.passInputType}
                                {...loginRegister("password", { required: true, minLength: 4 })}
                                className="passwordInput" />
                            <span className="showPass" onClick={() => showPass(setState, state.err)}>👁</span>
                        </div>
                        {loginErrors.password?.type === "required" && <span>Password is required</span>}
                        {loginErrors.password?.type === "minLength" && <span>Password must be at least 4 characters</span>}
                        {/* new span */}
                        <span className="suggest" onClick={() => setState(prev => ({ ...prev, resetPassModal: true }))}>
                            reset password
                        </span>
                    </div>
                    <div>
                        <button>Login</button> &nbsp;
                    </div>
                </form>
                <p className="changeLogin">not yet registered? <a onClick={() => navigate("/register")}>register</a></p>
            </div>
            {state.resetPassModal &&
                <div className="resetPassModal">
                    {state.otpErr && <div className="otpErr">{state.otpErr}</div>}
                    {!state.emailResetMsg &&<div className="closeResetPassModal" onClick={() => setState(prev => ({ ...prev, resetPassModal: false, otpErr: "", submittedEmail: false, otp: [], validOtp: false }))}>cancel</div>}
                    {!state.submittedEmail &&
                        <form onSubmit={sendOTP}>
                            <div className="insertEmail">
                                <label>Email:<input type="email" value={state.email} onChange={(e) => setState(prev => ({ ...prev, email: e.target.value }))} /></label>
                                <button type="submit">send reset password</button>
                            </div>
                        </form>
                    }
                    {state.submittedEmail && !state.validOtp && !state.emailResetMsg &&
                        <div className="insertOtp">
                            <div className="OTPinputBox">
                                <div className="inputsBox">
                                    {[0, 1, 2, 3, 4].map((i) => (
                                        <input
                                            key={i}
                                            ref={(el) => { inputRefs.current[i] = el! }}
                                            className="OTPinput"
                                            maxLength={1}
                                            onFocus={(e) => e.target.value = ""}
                                            onChange={(e) => {
                                                if (!/^[0-9a-zA-Z]$/.test(e.target.value)) {
                                                    e.target.value = "";
                                                    return
                                                }else{
                                                    e.target.value=e.target.value.toUpperCase()
                                                    ValidateOtp(e.target.value, i)
                                                }
                                            }
                                            }
                                            onKeyDown={(e) => {
                                                if (e.key === "Backspace" && !e.currentTarget.value && i > 0) {
                                                    inputRefs.current[i - 1]?.focus();
                                                }
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="otpInfoBox">
                                <span>insert the reset OTP you got by email</span>
                                <span className="lableOtp">Valid for 1 minute</span>
                                <span className="resendOtp" onClick={sendOTP}>resend OTP to {state.email}</span>
                            </div>
                        </div>
                    }
                    {state.validOtp &&
                        <form onSubmit={resetSubmit(setNewPass)}>
                            <div className="insertNewPass">
                                <label className="newPasswordWrapper">New Password:
                                    <input placeholder="Password" type={state.passInputType}
                                        {...resetRegister("password", { required: true, minLength: 4 })}
                                        className="newPasswordInput" />
                                    <span className="showPass" onClick={() => showPass(setState, state.err)}>👁</span>
                                </label>
                                {resetErrors.password?.type === "required" && <span>Password is required</span>}
                                {resetErrors.password?.type === "minLength" && <span>Password must be at least 4 characters</span>}
                                <button type="submit">save new password</button>
                            </div>
                        </form>
                    }
                    {state.emailResetMsg &&
                        <div className="insertEmail">
                            <div>{state.emailResetMsg}</div>
                        <button onClick={()=>
                            setState(prev => ({ ...prev,
                                resetPassModal: false,
                                otpErr: "",
                                submittedEmail: false,
                                otp: [],
                                validOtp: false,
                                email:"",
                                emailResetMsg:"",
                                uid:""
                            }))
                        }>close</button>
                        </div>
                    }
                </div>
            }
        </div>
    );

}

export default LoginView;
