import jwtAxios from "../Services/JwtAxios";
import config from "../../config/config.json";
import { logout } from "../Services/logout";
import { useNavigate } from "react-router-dom";
import { setMsg, type AppDispatch } from "../Data/ReduxModule";
import type { VacationType } from "../types/VacationType";
import type { ReportData } from "../types/ReportData";
import type { ReportsDisplayState } from "../types/ReportsDisplayState";
import { refreshToken } from "../Services/refreshToken";



export async function timeAnalyses(
    setState: React.Dispatch<React.SetStateAction<ReportsDisplayState>>,
    navigate: ReturnType<typeof useNavigate>,
    dispatch: AppDispatch
) {
    const fetchAndCreateReport = async () => {
        const vacations = await jwtAxios.get(`${config.server.url}${config.server.port}/vacations/`);
        const sorted = vacations.data.sort((a: any, b: any) => new Date(a.start).getTime() + new Date(b.start).getTime());
        const reportData: ReportData[] = [
            { label: "Previous Vacations", value: 0 },
            { label: "Ongoing Vacations", value: 0 },
            { label: "Future Vacations", value: 0 }
        ];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        sorted.forEach((vacation: VacationType) => {
            const startDate = new Date(vacation.start_time);
            const endDate = new Date(vacation.end_time)
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(0, 0, 0, 0);

            let index = 0;
            if (startDate <= today && endDate >= today) index = 1;
            else if (startDate > today) index = 2;
            reportData[index].value++;
        });
        setState((prev: any) => ({
            ...prev,
            data: reportData,
            loading: false,
            labels: "times",
            values: "vacations",
            reportName: "time_analyses",
            reportType: "doughnut"
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
        if (err.response.data === "Your login session has expired.") {
            const refreshed = await refreshToken();
            if (!refreshed.success) {
                setTimeout(() => {
                    logout(navigate, dispatch);
                    dispatch(setMsg(`${msg}. logging out`));
                    fail();
                }, config.uiTimeConfig.denyAccess);
            } else {
                try {
                    await fetchAndCreateReport();
                } catch (error) {
                    fail();
                }
            }
        }
        else if (msg === "You are not logged-in.") {
            setTimeout(() => logout(navigate, dispatch), config.uiTimeConfig.denyAccess);
            dispatch(setMsg(`${msg}. logging out...`));
            fail();
        }
        else {
            fail();
        }
    }
}
