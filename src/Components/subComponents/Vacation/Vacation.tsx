import { useEffect, useState } from "react";
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
import { refreshToken } from "../../../Services/refreshToken";


interface VacationProps extends VacationType {
    remountFatherComponent: () => void;
    setLoading: () => void;
    setNotLoading: () => void;
    imageUrl:string;
};

export default function Vacation(vacation: VacationProps) {
    const [state, setState] = useState({
        tracked: false,
        followerCount: 0,
        isEditing: false,
        showDeleteModal: false,
        vacationData: {
            ...vacation
        }
    });
    const formMethods = useForm<VacationType>();
    const stored = localStorage.getItem("loginData");
    const tracked = localStorage.getItem("trackedData");
    const loginData = stored ? JSON.parse(stored) : "";
    const role = loginData.role;
    const uid = loginData.uuid;
    const start = new Date(state.vacationData.start_time);
    const end = new Date(state.vacationData.end_time);

    useEffect(() => {
        if (tracked) {
            try {
                const parsed: Track[] = JSON.parse(tracked);
                let count = 0;
                let isTrackedByUser = false;
                parsed.forEach((track: Track) => {
                    if (track.vacation_id === state.vacationData.id) {
                        count++;
                        if (track.uid === uid) {
                            isTrackedByUser = true;
                        }
                    }
                });
                setState((prev) => ({ ...prev, tracked: isTrackedByUser, followerCount: count}))
            } catch (err) {
                console.log("Invalid tracked data in localStorage");
            }
        }
    }, [state.tracked]);

    function pad(num: number) {
        return num.toString().padStart(2, "0");
    };



    async function deleteVacation() {
        try {
            const deleted = await jwtAxios.delete(`${config.server.url}${config.server.port}/vacations/delete`, {
                data: { id: state.vacationData.id }
            });
            setState((prev) => ({ ...prev, showDeleteModal: false }))
            if (deleted.data.rowCount) {
                vacation.remountFatherComponent();
            }
        }catch (error: any) {
            console.log(error);
            const status = error.response?.status;
            if (status === 401 || status === 403) {
                const result = await refreshToken();
                if (result.success) {
                    const deleted = await jwtAxios.delete(`${config.server.url}${config.server.port}/vacations/delete`, {
                        data: { id: state.vacationData.id }
                    });
                    setState((prev) => ({ ...prev, showDeleteModal: false }))
                    if (deleted.data.affectedRows) {
                        vacation.remountFatherComponent();
                    }
                    return;
                } else {
                    setState((prev) => ({ ...prev, showDeleteModal: false }))
                }
            }
        }
    };

    return (
        <div className="vacationCard">
            {state.showDeleteModal && <div className="deleteModal">
                <div className="deleteCaption">are you sure you want to delete the vacation <strong>{state.vacationData.destination}</strong>?</div>
                <div className="deleteModalBtnBox">
                    <div className="cancelDelete" onClick={() => setState((prev) => ({ ...prev, showDeleteModal: false }))}>cancel</div>
                    <div className="confirmDelete" onClick={deleteVacation}>confirm</div>
                </div>
            </div>}
            <img src={state.vacationData.imageUrl} className="vacationImage" />
            {role === "user" && <FollowBox count={state.followerCount} toggle={() => toggleFollow(state, setState, vacation.setLoading, vacation.setNotLoading, +state.vacationData.id)} tracked={state.tracked} />}
            {role === "admin" && <EditAndDeleteBox  setState={setState} />}
            {!state.isEditing ?
                <>
                    <h3>{state.vacationData.destination}</h3>
                    <div className="infoBox">
                        <p>📅 {pad(start.getDate())}/{pad(start.getMonth() + 1)}/{start.getFullYear()} - {pad(end.getDate())}/{pad(end.getMonth() + 1)}/{end.getFullYear()}</p>
                        <p>💸 {state.vacationData.price} ₪</p>
                    </div>
                    <p className="description">{state.vacationData.description}</p>
                </>
                :
                <VacationForm mode="edit" onSubmit={(data) => updateVacation(data, +state.vacationData.id, setState)} defaultValues={vacation} fileRequired={false} onCancel={() => setState((prev) => ({ ...prev, isEditing: false }))} formMethods={formMethods} FormClassName="editVacationForm" />

            }
        </div>
    )

}