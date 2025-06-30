import type { VacationType } from "../types/VacationType";
import config from "../../config/config.json";

export function handlePagination(startIndex: number,displayedVacations:VacationType[],setState: React.Dispatch<React.SetStateAction<any>>) {
        if (startIndex < 0 || startIndex >= displayedVacations.length) return;
        const endIndex = Math.min(startIndex + config.vacationsOnPage, displayedVacations.length);
        const nextPage = displayedVacations.slice(startIndex, endIndex);
        setState((prev:any)=>({...prev,paginationStart:startIndex,paginationEnd:endIndex,visibleVacations:nextPage}));
    }