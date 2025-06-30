import axios from "axios";
import { useForm } from "react-hook-form";
import { useState } from "react";
import config from "../../../../config/config.json";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../../Data/ReduxModule";
import { setAuth } from "../../../Data/ReduxModule";
import { useNavigate } from "react-router-dom";
import {showPass} from "../../../Services/showPass"

interface Credentials {
    email: string;
    password: string;
}

function LoginView() {
    let { register, handleSubmit, formState: { errors } } = useForm<Credentials>();
    const [state,setState]= useState({err:"",passInputType:"password"})
    const dispatch = useDispatch<AppDispatch>();
    const navigate= useNavigate();

    async function login(credentials: Credentials) {
        try {
            const login = await axios.post(`${config.server.url}${config.server.port}/auth/login`, credentials)
            console.log(`${config.server.url}${config.server.port}/auth/login`)
            localStorage.setItem("loginData",JSON.stringify(login.data));
            navigate("/vacations");
            dispatch(setAuth(true));
        } catch (error:any) {
            console.log(error)
            if (error.response.data)
                setState({err:error.response.data,passInputType:state.passInputType});
            else setState({err:error.message,passInputType:state.passInputType});
        }
    }
    
    return (
        <div className="authView">
            <h1>User login</h1>
            {state.err &&<p className="loginErr">{state.err}</p>}
            <form onSubmit={handleSubmit(login)}>
                <div>
                    <label>Email:</label>
                    <input placeholder="Email" type="email" {...register("email", { required: true})} />
                    {errors.email?.type === "required" && <span>Email is required</span>}
                </div>
                <div>
                    <label>Password:</label>
                    <div className="passwordWrapper">
                        <input placeholder="Password" type={state.passInputType}
                            {...register("password", { required: true, minLength: 4 })}
                            className="passwordInput"/>
                        <span className="showPass" onClick={()=>showPass(setState,state.err)}>👁</span>
                    </div>
                    {errors.password?.type === "required" && <span>Password is required</span>}
                    {errors.password?.type === "minLength" && <span>Password must be at least 4 characters</span>}
                </div>
                <div>
                    <button>Login</button> &nbsp;
                </div>
            </form>
                <p className="changeLogin">not yet registered? <a onClick={()=>navigate("/register")}>register</a></p>
        </div>
    );

}

export default LoginView;
