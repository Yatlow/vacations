import axios from "axios";
const jwtAxios = axios.create();

jwtAxios.interceptors.request.use(request => {
    const stored = localStorage.getItem("loginData");
    if (stored) {
        const loginData = JSON.parse(stored)
        request.headers = {
            ...request.headers,
            Authorization: "Bearer " + loginData.token
        } as any;
    }

    return request;
});

export default jwtAxios;