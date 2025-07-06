import jwtAxios from "../../../Services/JwtAxios";
import { useEffect, useState } from "react";
import config from "../../../../config/config.json";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setMsg, type AppDispatch } from "../../../Data/ReduxModule";
import Vacation from "../../subComponents/Vacation/Vacation";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import type { VacationType } from "../../../types/VacationType";
import { logout } from "../../../Services/logout";
import { handlePagination } from "../../../Services/handlePagination";
import { applyFilters } from "../../../Services/applyFilters";
import { refreshToken } from "../../../Services/refreshToken";
import LoadingBox from "../../subComponents/LoadingBox/LoadingBox";
import unknownImg from "../../../assets/images/image-not-found-icon.png";
import { imageCache } from "../../../Data/imageCache";


interface VacationsState {
    allVacations: VacationType[],
    displayedVacations: VacationType[],
    visibleVacations: VacationType[],
    paginationStart: number,
    paginationEnd: number,
    followed: boolean,
    future: boolean,
    active: boolean,
    refresh: boolean,
    err: boolean,
    errInfo: any,
    loading: boolean
};

export default function Vacations() {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const [state, setState] = useState<VacationsState>({
        allVacations: [],
        displayedVacations: [],
        visibleVacations: [],
        followed: false,
        active: false,
        future: false,
        err: false,
        refresh: false,
        errInfo: "",
        paginationStart: 0,
        paginationEnd: 9,
        loading: true
    });
    const stored = localStorage.getItem("loginData");
    const loginData = stored ? JSON.parse(stored) : "";
    const role = loginData.role;
    const PAGE_SIZE = config.vacationsOnPage;

    useEffect(() => {
        const handleGetVacationsSuccess = async (data: VacationType[]) => {
            const sorted = data.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
            await Promise.all(sorted.map(async (vacation) => {
                if (!imageCache[vacation.picture_url]) {
                    try {
                        const res = await jwtAxios.get(`${config.server.url}${config.server.port}/vacations/image?image=${vacation.picture_url}`, { responseType: "blob" });
                        imageCache[vacation.picture_url] = URL.createObjectURL(res.data);
                    } catch (err:any) {
                        const status = err.response?.status;
                        if (status === 401 || status === 403) {
                            const result = await refreshToken();
                            if (result.success) {
                                const retry = await jwtAxios.get(`${config.server.url}${config.server.port}/vacations/image?image=${vacation.picture_url}`, { responseType: "blob" });
                                imageCache[vacation.picture_url] = URL.createObjectURL(retry.data);
                                return;
                            } else {
                                imageCache[vacation.picture_url] = unknownImg;
                            }
                        }
                    }
                }
            }));
            setState((prev) => ({
                ...prev, followed: false, future: false, active: false,
                allVacations: sorted, paginationStart: 0, paginationEnd: PAGE_SIZE, displayedVacations: sorted,
                visibleVacations: sorted.slice(0, PAGE_SIZE), loading: false
            }));
        };
        async function fetchVacationsAndTracked() {
            const getVacations = async () => jwtAxios.get(`${config.server.url}${config.server.port}/vacations`);
            const getTrackings = async () => jwtAxios.get(`${config.server.url}${config.server.port}/vacations/track`);
            try {
                const vacationsRes = await getVacations();
                const trackingRes = await getTrackings();
                localStorage.setItem("trackedData", JSON.stringify(trackingRes.data.rows));
                handleGetVacationsSuccess(vacationsRes.data.rows)

            } catch (error: any) {
                console.log(error)
                const status = error.response?.status;
                if (status === 401 || status === 403) {
                    const result = await refreshToken();
                    if (result.success) {
                        const retry = await getVacations();
                        if (retry.data.rows.length > 0) {
                            await handleGetVacationsSuccess(retry.data.rows);
                            const trackingRes = await getTrackings();
                            localStorage.setItem("trackedData", JSON.stringify(trackingRes.data.rows));
                        }
                        return;
                    } else {
                        setTimeout(() => {
                            logout(navigate, dispatch);
                            dispatch(setMsg(result.msg || "Session expired – logging out"));
                            const msg = error.response?.data ? error.response.data : error.message;
                            setState((prev) => ({ ...prev, err: true, errInfo: msg, loading: false }));
                        }, config.uiTimeConfig.denyAccess);
                        return;
                    }
                }
            } finally {
                setState((prev) => ({ ...prev, loading: false }));
            }
        };
        fetchVacationsAndTracked();
    }, [state.refresh]);


    return (
        <>
            <div className="componentBox">
                {state.loading && <LoadingBox />}
                <h1>Our Vacations!</h1>
                {state.err && <div className="fail">{state.errInfo}</div>}
                <div className="sortBox">
                    <div className="filtersHead">Filters:</div>
                    {role === "user" &&
                        <div><input id="followed" type="checkbox" checked={state.followed}
                            onChange={(e) => {
                                const updated = { ...state, followed: e.target.checked };
                                setState(updated);
                                applyFilters(updated, setState);
                            }} /><label htmlFor="followed">Only vacations I follow</label></div>}
                    <div><input id="future" type="checkbox" disabled={state.active} checked={state.future}
                        onChange={(e) => {
                            const updated = { ...state, future: e.target.checked };
                            setState(updated);
                            applyFilters(updated, setState);
                        }} /><label htmlFor="future" className={state.active ? "disabledCheck" : ""}>Only future vacations</label></div>
                    <div><input id="active" type="checkbox" disabled={state.future} checked={state.active}
                        onChange={(e) => {
                            const updated = { ...state, active: e.target.checked };
                            setState(updated);
                            applyFilters(updated, setState);
                        }} /><label htmlFor="active" className={state.future ? "disabledCheck" : ""}>Only vacations currently ongoing</label></div>
                </div>
                {state.displayedVacations.length > PAGE_SIZE && <div className="paginationBox">
                    <div className={state.paginationStart > 0 ? "activePagination" : "disabledPagination"} onClick={() => handlePagination(0, state.displayedVacations, setState)}><ChevronsLeft size={16} />1</div>
                    <div className={state.paginationStart > 0 ? "activePagination" : "disabledPagination"} onClick={() => handlePagination(state.paginationStart - PAGE_SIZE, state.displayedVacations, setState)}>
                        <ChevronLeft size={16} />{`[${Math.max(1, state.paginationStart - PAGE_SIZE + 1)}-${Math.max(9, state.paginationStart)}]`}</div>
                    <div className="currentPage">{`[${state.paginationStart + 1}-${state.paginationEnd}]`}</div>
                    <div className={state.paginationEnd < state.displayedVacations.length - 1 ? "activePagination" : "disabledPagination"} onClick={() => handlePagination(state.paginationStart + PAGE_SIZE, state.displayedVacations, setState)}>
                        {`[${state.paginationStart === 0 ? 10 : Math.min(state.paginationStart + PAGE_SIZE, state.paginationEnd + 1 - state.displayedVacations.length % 9)}-${Math.min(state.displayedVacations.length, state.paginationEnd + PAGE_SIZE)}]`}
                        <ChevronRight size={16} /></div>
                    <div className={state.paginationEnd < state.displayedVacations.length - 1 ? "activePagination" : "disabledPagination"} onClick={() => {
                        const lastPageStart = Math.floor((state.displayedVacations.length - 1) / PAGE_SIZE) * PAGE_SIZE;
                        handlePagination(lastPageStart, state.displayedVacations, setState);
                    }}>{state.displayedVacations.length}<ChevronsRight size={16} /></div>
                </div>}
                <div className="vacationsBox">
                    {state.visibleVacations.map(vacation => (
                        <Vacation key={vacation.id} {...vacation} remountFatherComponent={() => setState((prev) => ({ ...prev, refresh: !state.refresh }))}
                            setLoading={() => setState((prev) => ({ ...prev, loading: true }))} setNotLoading={() => setState((prev) => ({ ...prev, loading: false }))} imageUrl={imageCache[vacation.picture_url] ?? unknownImg} />
                    ))}
                </div>
            </div >
        </>
    )
}

