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
import LoadingBox from "../../subComponents/LoadingBox/LoadingBox";

export default function AddVacation() {
    const formMethods = useForm<VacationType>();
    const { reset } = formMethods;
    const [state, setState] = useState({ msg: "", class: "", loading: false });

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
        setState({ msg: "successfully added!", class: "success", loading: false });
        reset({
            destination: "",
            description: "",
            price: "",
            start_time: now.toISOString().split('T')[0],
            end_time: tomorrow.toISOString().split('T')[0],
            picture_url: ""
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async function addVacation(data: VacationType) {
        const myFormData = new FormData();
        myFormData.append("destination", data.destination);
        myFormData.append("description", data.description);
        myFormData.append("start_time", data.start_time.toString());
        myFormData.append("end_time", data.end_time.toString());
        myFormData.append("price", data.price);
        myFormData.append("path", config.server.imagePath);
        const imageFile: any = data.picture_url[0];
        const destination = data.destination.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/gi, '');
        const fileExtension = imageFile.name.substring(imageFile.name.lastIndexOf('.'));
        const timestamp = Date.now();
        myFormData.append("picture_url", `${destination}_${timestamp}${fileExtension}`);
        myFormData.append("image", imageFile);

        const sendVacation = async () => {
            setState((prevState) => ({ ...prevState, loading: true }));
            return await jwtAxios.post(`${config.server.url}${config.server.port}/vacations/add`, myFormData);
        }
        try {
            const newVacation: any = await sendVacation();
            if (newVacation.data.rowCount > 0) {
                handleSuccess();
            }
        } catch (error: any) {
            const status = error.response?.status;
            if (status === 401 || status === 403) {
                const result = await refreshToken();
                if (result.success) {
                    const retry = await sendVacation();
                    if (retry.data.rowCount > 0) handleSuccess();
                    return;
                } else {
                    logout(navigate, dispatch);
                    dispatch(setMsg(result.msg || "Session expired – logging out"));
                    return;
                }
            }

        }
    }
    return (
        <>
            <div className="componentBox">
                {state.loading && <LoadingBox />}
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