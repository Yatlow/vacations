import axios from "axios";
import config from "../../config/config.json"

export async function refreshToken(){
    const stored = localStorage.getItem("loginData");
    if (!stored) return { success: false, msg: "No login data" };

    const loginData =JSON.parse(stored);
    const {refreshToken}= loginData.refreshToken;
    if (!refreshToken) return { success: false, msg: "No refresh token found." };
    try {
        const res = await axios.post(`${config.server.url}${config.server.port}/auth/refresh`, {refreshToken});
        const { token, refreshToken: newRefresh } = res.data;
        loginData.token=token;
        loginData.refreshToken = newRefresh ?? refreshToken;

        localStorage.setItem("loginData", JSON.stringify(loginData));
        
        return { success: true, msg: "" }
    } catch (error: any) {
        console.log(error)
        const msg = error.response ? error.response.data : error.message;
        return { success: false, msg }

    }

}
