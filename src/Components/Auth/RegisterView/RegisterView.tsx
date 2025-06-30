import axios from "axios";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import config from "../../../../config/config.json";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../../Data/ReduxModule";
import { setAuth } from "../../../Data/ReduxModule";
import { useNavigate ,useLocation } from "react-router-dom";
import { showPass } from "../../../Services/showPass";
import { getRandomPassword } from "../../../Services/getRandomPassword";

interface User {
    email: string;
    password: string;
    firstName: string;
    familyName: string;
}

function RegisterView() {
    let { register, handleSubmit, formState: { errors },setValue,watch  } = useForm<User>();
    const [state,setState]= useState({err:"",passInputType:"password"})
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const location = useLocation();

    async function registerUser(userData: User) {
        try {
            const register = await axios.post(`${config.server.url}${config.server.port}/auth/register`, userData)
            localStorage.setItem("loginData", JSON.stringify(register.data));
            navigate("/vacations");
            dispatch(setAuth(true))
        } catch (error: any) {
            console.log(error)
            if (error.response.data)
                setState({err:error.response.data,passInputType:state.passInputType});
            else setState({err:error.message,passInputType:state.passInputType});
        }
    };

    useEffect(()=>{
        if (location.pathname==="/") navigate("/register")
    },[])

    return (
        <div className={"authView"}>
            <h1>Register new user</h1>
            {state.err && <p className="loginErr">{state.err}</p>}
            <form onSubmit={handleSubmit(registerUser)}>
                <div>
                    <label>Email:</label>
                    <input placeholder="Email" type="email" {...register("email", { required: true })} />
                    {errors.email?.type === "required" && <span>Email is required</span>}
                </div>
                <div>
                    <label>Password:</label>
                    <div className="passwordWrapper">
                        <input placeholder="Password" type={state.passInputType}
                            {...register("password", { required: true, minLength: 4 })}
                            className="passwordInput" />
                        <span className="showPass" onClick={()=>showPass(setState,state.err)}>👁</span>
                    </div>
                    {!watch ("password") && <span className="suggest" onClick={()=>{setValue("password",getRandomPassword());showPass(setState,state.err)}}>suggest a strong password</span>}
                    {errors.password?.type === "required" && <span>Password is required</span>}
                    {errors.password?.type === "minLength" && <span>Password must be at least 4 characters</span>}
                </div>
                <div>
                    <label>First Name:</label>
                    <input placeholder="First Name" {...register("firstName", { required: true })} />
                    {errors.firstName?.type === "required" && <span>First Name is required</span>}
                </div>
                <div>
                    <label>Family Name:</label>
                    <input placeholder="Family Name" {...register("familyName", { required: true })} />
                    {errors.familyName?.type === "required" && <span>Family Name is required</span>}
                </div>
                <div>
                    <button>register</button> &nbsp;
                </div>
            </form>
            <p className="changeLogin">already registered? <a onClick={() => navigate("/login")}>log in</a></p>
        </div>
    );

}

export default RegisterView;
