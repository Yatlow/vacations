import axios from "axios";
import config from "../../config/config.json"
import jwtAxios from "./JwtAxios";

export async function refreshToken(){
    const stored = localStorage.getItem("loginData");
    const loginData = stored ? JSON.parse(stored) : "";
    const refreshToken= loginData.refreshToken;
    let refreshed=false;
    let msg="";
    if (!refreshToken) return { success: false, msg: "No refresh token found." };
    try {
        const newToken = await axios.post(`${config.server.url}${config.server.port}/auth/refresh`, {refreshToken});
        loginData.token=newToken.data;
        localStorage.setItem("loginData", JSON.stringify(loginData));
        jwtAxios.defaults.headers.common["Authorization"] = `Bearer ${loginData.token}`;
        refreshed=true;
    } catch (error:any) {
        console.log(error)
        msg=error.response?error.response.data:error.message
    }finally{
        return {success:refreshed,msg:msg}
    }

}
