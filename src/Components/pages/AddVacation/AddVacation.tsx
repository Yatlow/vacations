import { useEffect, useState } from "react";
import config from "../../../../config/config.json";
import jwtAxios from "../../../Services/JwtAxios";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { type AppDispatch } from "../../../Data/ReduxModule";
import type { VacationType } from "../../../types/VacationType";
import { logout } from "../../../Services/logout";
import VacationForm from "../../subComponents/VacationForm/VacationForm";
import { setMsg } from "../../../Data/ReduxModule";
import { refreshToken } from "../../../Services/refreshToken";


export default function AddVacation() {
    const formMethods = useForm<VacationType>();
    const { reset } = formMethods;
    const [state, setState] = useState({ msg: "", class: "" });

    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const stored = localStorage.getItem("loginData");
    const loginData = stored ? JSON.parse(stored) : "";
    const role = loginData.role;
    const now = new Date();
    const tomorrow = new Date(now.getTime() + (1000 * 60 * 60 * 24))

    useEffect(() => {
        if (role === "user") {
            logout(navigate, dispatch);
            dispatch(setMsg("logging out... access denied"))
        }
    }, [role]);
    function handleSuccess() {
        setState({ msg: "successfully added!", class: "success" });
        reset({
            destination: "",
            description: "",
            price: "",
            start: now.toISOString().split('T')[0],
            end: tomorrow.toISOString().split('T')[0],
            pictureUrl: ""
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async function addVacation(data: VacationType) {
        const myFormData = new FormData();
        myFormData.append("destination", data.destination);
        myFormData.append("description", data.description);
        myFormData.append("start", data.start.toString());
        myFormData.append("end", data.end.toString());
        myFormData.append("price", data.price);
        myFormData.append("path", config.server.imagePath);
        const imageFile: any = data.pictureUrl[0];
        const destination = data.destination.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/gi, '');
        const fileExtension = imageFile.name.substring(imageFile.name.lastIndexOf('.'));
        const timestamp = Date.now();
        myFormData.append("pictureUrl", `${destination}_${timestamp}${fileExtension}`);
        myFormData.append("image", imageFile);

        const sendVacation = async () =>
            await jwtAxios.post(`${config.server.url}${config.server.port}/vacations/add`, myFormData);
        try {
            const newVacation = await sendVacation();
            if (newVacation.data.affectedRows > 0) {
                handleSuccess();
            }
        } catch (error: any) {
            if (error.response.data === "Your login session has expired.") {
                const refreshed = await refreshToken();
                if (!refreshed.success) {
                    setState({
                        msg: refreshed.msg,
                        class: "fail"
                    });
                    window.scrollTo({ top: 0, behavior: "smooth" });
                    setTimeout(() => {
                        console.log(error.response)
                        logout(navigate, dispatch);
                        dispatch(setMsg(`${error.response.data}. logging out...`))
                    }, config.uiTimeConfig.denyAccess);
                } else {
                    const retry = await sendVacation()
                    if (retry.data.affectedRows > 0) {
                        handleSuccess();
                    }
                }
            } else {
                console.error("Server message:", error.response.data.message || "No message");
                console.error("Validation errors:", error.response.data.errors || "No additional error info");
                const errorsObject = error.response.data.errors;
                let errorsArrayMsg = "no message";
                if (errorsObject) {
                    const errorsArray = Object.entries(errorsObject).map(([key, value]) => `${key}: ${value}`);
                    errorsArrayMsg = errorsArray.join(" | ")
                }

                setState({
                    msg: errorsArrayMsg,
                    class: "fail"
                });
                if (error.response.data === "You are not logged-in.") {
                    setState({
                        msg: error.response.data,
                        class: "fail"
                    });
                    window.scrollTo({ top: 0, behavior: "smooth" });
                    setTimeout(() => {
                        console.log(error.response)
                        logout(navigate, dispatch);
                        dispatch(setMsg(`${error.response.data}. logging out...`))
                    }, config.uiTimeConfig.denyAccess);
                }
            }
        }

    }
    return (
        <>
            <div className="componentBox">
                {role === "user" && <h1>restricted access!</h1>}
                {role === "admin" &&
                    <div>
                        <h1>Add Vacation</h1>
                        {state.msg && <div className={state.class}>{state.msg}</div>}
                        <VacationForm FormClassName="addVacationForm" mode="add" onSubmit={addVacation} fileRequired={true} formMethods={formMethods} />
                    </div>}
            </div>
        </>
    )
}