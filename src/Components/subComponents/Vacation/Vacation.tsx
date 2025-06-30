import { useEffect, useState, type JSX } from "react";
import config from "../../../../config/config.json";
import jwtAxios from "../../../Services/JwtAxios";
import { useForm } from "react-hook-form";
import type { VacationType } from "../../../types/VacationType";
import type { Track } from "../../../types/Track";
import VacationForm from "../VacationForm/VacationForm";
import FollowBox from "../FollowBox/FollowBox";
import EditAndDeleteBox from "../EditAndDeleteBox/EditAndDeleteBox";
import { toggleFollow } from "../../../Services/toggleFollow";
import { updateVacation } from "../../../Services/updateVacation";

interface VacationProps extends VacationType {
    remountFatherComponent: () => void;
};

export default function Vacation(vacation: VacationProps) {
    const [state, setState] = useState({
        tracked: false,
        followerCount: 0,
        image: null as JSX.Element | null,
        isEditing: false,
        showDeleteModal: false,
        mounter: true,
    });
    const formMethods = useForm<VacationType>();
    const stored = localStorage.getItem("loginData");
    const tracked = localStorage.getItem("trackedData");
    const loginData = stored ? JSON.parse(stored) : "";
    const role = loginData.role;
    const uid = loginData.uuid;
    const start = new Date(vacation.start);
    const end = new Date(vacation.end);

    useEffect(() => {
        async function fetchImage() {
            try {
                const image = await jwtAxios.get(`${config.server.url}${config.server.port}/vacations/image?image=${vacation.pictureUrl}`,
                    { responseType: "blob" }
                );
                const imageUrl = URL.createObjectURL(image.data);
                setState((prev)=>({...prev,image:<img src={imageUrl} />}))
            } catch (error: any) {
                console.log(error.message)
                setState((prev)=>({...prev,image:<img src="src\assets\images\image-not-found-icon.png" />}))
            }
        };
        fetchImage();
        if (tracked) {
            try {
                const parsed: Track[] = JSON.parse(tracked);
                let count = 0;
                let isTrackedByUser = false;
                parsed.forEach((track: Track) => {
                    if (track.vacationId === vacation.id) {
                        count++;
                        if (track.uid === uid) {
                            isTrackedByUser = true;
                        }
                    }
                });
                setState((prev)=>({...prev,tracked:isTrackedByUser,followerCount:count}))
            } catch (err) {
                console.log("Invalid tracked data in localStorage");
            }
        }
    }, [vacation, state.mounter]);

    function pad(num: number) {
        return num.toString().padStart(2, "0");
    };

   

    async function deleteVacation() {
        try {
            const deleted = await jwtAxios.delete(`${config.server.url}${config.server.port}/vacations/delete`, {
                data: { id: vacation.id }
            });
            setState((prev)=>({...prev,showDeleteModal:false}))
            if (deleted.data.affectedRows) {
                vacation.remountFatherComponent();
            }
        } catch (error) {
            console.log(error)
        }
    };

    return (
        <div className="vacationCard">
            {state.showDeleteModal && <div className="deleteModal">
                <div className="deleteCaption">are you sure you want to delete the vacation <strong>{vacation.destination}</strong>?</div>
                <div className="deleteModalBtnBox">
                    <div className="cancelDelete" onClick={() => setState((prev)=>({...prev,showDeleteModal:false}))}>cancel</div>
                    <div className="confirmDelete" onClick={deleteVacation}>confirm</div>
                </div>
            </div>}
            {state.image}
            {role === "user" && <FollowBox count={state.followerCount} toggle={()=>toggleFollow(state,setState,+vacation.id)} tracked={state.tracked}/>}
            {role === "admin" && <EditAndDeleteBox followerCount={state.followerCount} image={state.image} isEditing={state.isEditing} mounter={state.mounter} setState={setState} showDeleteModal={state.showDeleteModal} tracked={state.tracked}/>}
            {!state.isEditing ?
                <>
                    <h3>{vacation.destination}</h3>
                    <div className="infoBox">
                        <p>📅 {pad(start.getDate())}/{pad(start.getMonth() + 1)}/{start.getFullYear()} - {pad(end.getDate())}/{pad(end.getMonth() + 1)}/{end.getFullYear()}</p>
                        <p>💸 {vacation.price} ₪</p>
                    </div>
                    <p className="description">{vacation.description}</p>
                </>
                :
                <VacationForm mode="edit" onSubmit={(data)=>updateVacation(data,+vacation.id,setState,vacation.remountFatherComponent)} defaultValues={vacation} fileRequired={false} onCancel={() => setState((prev)=>({...prev,isEditing:false}))} formMethods={formMethods} FormClassName="editVacationForm"/>

            }
        </div>
    )

}