import type { VacationType } from "../types/VacationType";
import config from "../../config/config.json";
import jwtAxios from "./JwtAxios";
import { refreshToken } from "./refreshToken";
import { imageCache } from "../Data/imageCache";

interface updateVacationData extends VacationType {
    imageUrl: string;
}

export async function updateVacation(data: updateVacationData, id: number, setState: React.Dispatch<React.SetStateAction<any>>,  setLoad: React.Dispatch<React.SetStateAction<any>>, setNotLoading: React.Dispatch<React.SetStateAction<any>>) {
    let imagePublicUrl="";
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
        setLoad(true)
        const newV= await jwtAxios.put(`${config.server.url}${config.server.port}/vacations/update`, myFormData);
        imagePublicUrl= newV.data.pic;
        const newVacation: Record<string, any> = {};
        for (const [key, value] of myFormData.entries()) {
            (newVacation as any)[key] = value;
        }
        if (!newVacation.picture_url) {
            newVacation.imageUrl = data.imageUrl;
            newVacation.picture_url = data.picture_url;
        } else {
            if (typeof data.picture_url === "string" && imageCache[data.picture_url]) {
                URL.revokeObjectURL(imageCache[data.picture_url]);
                delete imageCache[data.picture_url];
            }
            const res = await jwtAxios.get(imagePublicUrl, { responseType: "blob" });
            const blobUrl = URL.createObjectURL(res.data);
            imageCache[newVacation.pictureUrl] = blobUrl;
            newVacation.imageUrl = blobUrl;
        }
        setState((prev: any) => ({ ...prev, isEditing: false, tracked: !prev.tracked, vacationData: newVacation }));
    } catch (error: any) {
        const status = error.response?.status;
        if (status === 401 || status === 403) {
            const result = await refreshToken();
            if (result.success) {
                await jwtAxios.put(`${config.server.url}${config.server.port}/vacations/update`, myFormData);
                const newVacation: Record<string, any> = {};
                for (const [key, value] of myFormData.entries()) {
                    (newVacation as any)[key] = value;
                }
                if (!newVacation.picture_url) {
                    newVacation.imageUrl = data.imageUrl;
                    newVacation.picture_url = data.picture_url;
                } else {
                    if (typeof data.picture_url === "string" && imageCache[data.picture_url]) {
                        URL.revokeObjectURL(imageCache[data.picture_url]);
                        delete imageCache[data.picture_url];
                    }
                    const res = await jwtAxios.get(`${config.server.url}${config.server.port}/vacations/image?image=${newVacation.picture_url}`, { responseType: "blob" });
                    const blobUrl = URL.createObjectURL(res.data);
                    imageCache[newVacation.pictureUrl] = blobUrl;
                    newVacation.imageUrl = blobUrl;
                }
                setState((prev: any) => ({ ...prev, isEditing: false, tracked: !prev.tracked, vacationData: newVacation }));
                return;
            } else {
                console.error("Server message:", error.response.data.message || "No message");
                console.error("Validation errors:", error.response.data.errors || "No additional error info");
                return;
            }
        }
    }finally{
        setNotLoading(false)
    }

}