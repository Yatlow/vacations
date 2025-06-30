import jwtAxios from "./JwtAxios";
import config from "../../config/config.json";

export async function toggleFollow(state:any,setState:React.Dispatch<React.SetStateAction<any>>,id:number) {
    const stored = localStorage.getItem("loginData");
    const loginData = stored ? JSON.parse(stored) : "";
    const uid = loginData.uuid;
    const followData = {
        action: state.tracked ? "delete" : "add",
        uuid: uid,
        vacation_id: id
    }
    try {
        console.log(followData)
        const toggleFollow = await jwtAxios.post(`${config.server.url}${config.server.port}/vacations/track`, followData);
        if (toggleFollow.data.rowCount) {
            const trackingRes = await jwtAxios.get(`${config.server.url}${config.server.port}/vacations/track`);
            console.log(trackingRes.data.rows)
            localStorage.setItem("trackedData", JSON.stringify(trackingRes.data.rows));
            setState((prev:any) => ({ ...prev, mounter: !state.mounter }))
        }
    } catch (error) {
        console.log(error)
    }
};