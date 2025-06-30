import jwtAxios from "../Services/JwtAxios";
import config from "../../config/config.json";
import { logout } from "../Services/logout";
import { useNavigate } from "react-router-dom";
import { setMsg, type AppDispatch } from "../Data/ReduxModule";
import type { VacationType } from "../types/VacationType";
import type { ReportData } from "../types/ReportData";
import type { ReportsDisplayState } from "../types/ReportsDisplayState";
import { refreshToken } from "../Services/refreshToken";



export async function vacationsPerYear(
    setState: React.Dispatch<React.SetStateAction<ReportsDisplayState>>,
    navigate: ReturnType<typeof useNavigate>,
    dispatch: AppDispatch
) {
    const fetchAndCreateReport = async () => {
        const vacations = await jwtAxios.get<VacationType[]>(`${config.server.url}${config.server.port}/vacations/`);
        const reportData:ReportData[]=[];
        const years=Array.from(new Set(vacations.data.map(vacation => new Date(vacation.start).getFullYear())));
        years.sort((a,b)=>a+b)
        
        years.forEach((year) => {
            const count=vacations.data.filter(vacation=>new Date (vacation.start).getFullYear()===year);
            reportData.push({
                label:String(year),
                value:count.length
            })
        });
        
        setState((prev:ReportsDisplayState) => ({
            ...prev,
            data: reportData,
            loading: false,
            labels: "years",
            values:"vacations",
            reportName:"vacation_years",
            reportType:"line"
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
