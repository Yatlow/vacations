import type { Track } from "../types/Track";


export function applyFilters(state:any,setState:React.Dispatch<React.SetStateAction<any>>) {
    let filtered = [...state.allVacations];
    if (state.followed) {
        const tracked = localStorage.getItem("trackedData");
        const stored = localStorage.getItem("loginData");
            if (stored && tracked) {
                const { uuid } = JSON.parse(stored);
                const trackedArray: Track[] = JSON.parse(tracked);
                const followedIds = trackedArray.filter(track => track.uid === uuid).map(track => track.vacation_id);
                filtered = filtered.filter(vacation => followedIds.includes(vacation.id));
            }
        };
        if (state.future) {
            const now = new Date();
            filtered = filtered.filter(vacation => new Date(vacation.start) > now);
        };
        if (state.active) {
            const now = new Date();
            filtered = filtered.filter(vac => new Date(vac.start) <= now && new Date(vac.end) >= now);
        };
        setState((prev:any)=>({...prev,displayedVacations:filtered,visibleVacations:filtered.slice(0,9),paginationStart:0,paginationEnd:9}));
    }