import jwtAxios from "../Services/JwtAxios";
import config from "../../config/config.json";
import { logout } from "../Services/logout";
import { useNavigate } from "react-router-dom";
import { setMsg, type AppDispatch } from "../Data/ReduxModule";
import type { VacationType } from "../types/VacationType";
import type { Track } from "../types/Track";
import type { ReportData } from "../types/ReportData";
import type { ReportsDisplayState } from "../types/ReportsDisplayState";
import { refreshToken } from "../Services/refreshToken";



export async function followersPerDestination(
    setState: React.Dispatch<React.SetStateAction<ReportsDisplayState>>,
    navigate: ReturnType<typeof useNavigate>,
    dispatch: AppDispatch
) {

    const fetchAndCreateReport = async () => {
        const vacations = await jwtAxios.get(`${config.server.url}${config.server.port}/vacations/`);
        const tracked = await jwtAxios.get(`${config.server.url}${config.server.port}/vacations/track`);
        const reportData: ReportData[] = [];
        vacations.data.rows.forEach((vacation: VacationType) => {
            const count = tracked.data.rows.filter((track: Track) => track.vacation_id === vacation.id)
            reportData.push({
                label: vacation.destination,
                value: count.length
            })
        });
        setState((prev) => ({
            ...prev,
            data: reportData,
            loading: false,
            labels: "destination",
            values: "followers",
            reportName: "followers_vacation",
            reportType: "bar"
        }));
    }
    try {
        await fetchAndCreateReport();
    } catch (err: any) {
        const msg = err.response?.data || err.message;
        const fail = () => {
            setState((prev) => ({
                ...prev,
                err: true,
                errInfo: msg,
                loading: false
            }));
        }
        const status = err.response?.status;
        if (status === 401 || status === 403) {
            const result = await refreshToken();
            if (result.success) {
                await fetchAndCreateReport();
            } else {
                setTimeout(() => {
                    logout(navigate, dispatch);
                    dispatch(setMsg(`${msg}. logging out`));
                    fail();
                }, config.uiTimeConfig.denyAccess);
                return;
            }
        }
        else {
            fail();
        }
    }
}
