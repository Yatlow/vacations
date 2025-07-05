import jwtAxios from "./JwtAxios";
import config from "../../config/config.json";
import { refreshToken } from "./refreshToken";

export async function toggleFollow(state: any, setState: React.Dispatch<React.SetStateAction<any>>, setLoad: React.Dispatch<React.SetStateAction<any>>, setNotLoading: React.Dispatch<React.SetStateAction<any>>, id: number) {
    const stored = localStorage.getItem("loginData");
    const loginData = stored ? JSON.parse(stored) : "";
    const uid = loginData.uuid;
    const followData = {
        action: state.tracked ? "delete" : "add",
        uuid: uid,
        vacation_id: id
    }
    try {
        setLoad(true)
        const toggleFollow = await jwtAxios.post(`${config.server.url}${config.server.port}/vacations/track`, followData);
        if (toggleFollow.data.rowCount>0) {
            const trackingRes = await jwtAxios.get(`${config.server.url}${config.server.port}/vacations/track`);
            console.log(trackingRes.data.rows)
            localStorage.setItem("trackedData", JSON.stringify(trackingRes.data.rows));
            setState((prev:any) => ({ ...prev, mounter: !state.mounter }))
        }
    } catch (error: any) {
        console.log(error)
        const status = error.response?.status;
        if (status === 401 || status === 403) {
            const result = await refreshToken();
            if (result.success) {
                const toggleFollow = await jwtAxios.post(`${config.server.url}${config.server.port}/vacations/track`, followData);
                if (toggleFollow.data.affectedRows>0) {
                    const trackingRes = await jwtAxios.get(`${config.server.url}${config.server.port}/vacations/track`);
                    localStorage.setItem("trackedData", JSON.stringify(trackingRes.data));
                    setState((prev: any) => ({ ...prev, mounter: !state.mounter }))
                }
                return;
            }
        }
    }
    finally{
        setNotLoading(false)
    }
};