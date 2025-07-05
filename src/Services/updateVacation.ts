import type { VacationType } from "../types/VacationType";
import config from "../../config/config.json";
import jwtAxios from "./JwtAxios";
import { refreshToken } from "./refreshToken";

export async function updateVacation(data: VacationType,id:number,setState:React.Dispatch<React.SetStateAction<any>>,refresh:Function) {
        const myFormData = new FormData();
        myFormData.append("id", id.toString());
        myFormData.append("destination", data.destination);
        myFormData.append("description", data.description);
        myFormData.append("start_time", data.start_time.toString());
        myFormData.append("end_time", data.end_time.toString());
        myFormData.append("price", data.price);
        myFormData.append("path", config.server.imagePath);
        const imageFile: any = data.picture_url[0];
        if (imageFile && typeof data.picture_url != "string") {
            const destination = data.destination.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/gi, '');
            const fileExtension = imageFile.name.substring(imageFile.name.lastIndexOf('.'));
            const timestamp = Date.now();
            myFormData.append("picture_url", `${destination}_${timestamp}${fileExtension}`);
            myFormData.append("image", imageFile);
        }
        try {
            console.log(myFormData)
            await jwtAxios.put(`${config.server.url}${config.server.port}/vacations/update`, myFormData);
            setState((prev:any)=>({...prev,isEditing:false}));
            refresh();
        } catch (error: any) {
        const status = error.response?.status;
        if (status === 401 || status === 403) {
            const result = await refreshToken();
            if (result.success) {
                await jwtAxios.put(`${config.server.url}${config.server.port}/vacations/update`, myFormData);
                setState((prev: any) => ({ ...prev, isEditing: false }));
                refresh();
                return;
            } else {
                console.error("Server message:", error.response.data.message || "No message");
                console.error("Validation errors:", error.response.data.errors || "No additional error info");
                return;
            }
        }
    }

    }