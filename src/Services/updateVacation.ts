import type { VacationType } from "../types/VacationType";
import config from "../../config/config.json";
import jwtAxios from "./JwtAxios";

export async function updateVacation(data: VacationType,id:number,setState:React.Dispatch<React.SetStateAction<any>>,refresh:Function) {
        const myFormData = new FormData();
        myFormData.append("id", id.toString());
        myFormData.append("destination", data.destination);
        myFormData.append("description", data.description);
        myFormData.append("start", data.start.toString());
        myFormData.append("end", data.end.toString());
        myFormData.append("price", data.price);
        myFormData.append("path", config.server.imagePath);
        const imageFile: any = data.pictureUrl[0];
        if (imageFile && typeof data.pictureUrl != "string") {
            const destination = data.destination.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/gi, '');
            const fileExtension = imageFile.name.substring(imageFile.name.lastIndexOf('.'));
            const timestamp = Date.now();
            myFormData.append("pictureUrl", `${destination}_${timestamp}${fileExtension}`);
            myFormData.append("image", imageFile);
        }
        try {
            await jwtAxios.put(`${config.server.url}${config.server.port}/vacations/update`, myFormData);
            setState((prev:any)=>({...prev,isEditing:false}));
            refresh();
        } catch (error: any) {
            console.error("Server message:", error.response.data.message || "No message");
            console.error("Validation errors:", error.response.data.errors || "No additional error info");
        }

    }