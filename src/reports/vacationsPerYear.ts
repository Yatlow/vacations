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
        const result = await jwtAxios.get(`${config.server.url}${config.server.port}/vacations/`);
        const reportData:ReportData[]=[];
        const vacations:VacationType[]= result.data.rows;
        const years=Array.from(new Set(vacations.map(vacation => new Date(vacation.start_time).getFullYear())));
        years.sort((a,b)=>a+b)
        
        years.forEach((year) => {
            const count=vacations.filter(vacation=>new Date (vacation.start_time).getFullYear()===year);
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
    }catch (err: any) {
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
