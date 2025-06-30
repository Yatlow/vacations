import type { ReportData } from "./ReportData";

export type ReportsDisplayState ={
    err: boolean,
    errInfo: string,
    loading: boolean,
    data: ReportData[],
    reportType:'bar' | 'line' | 'pie' | 'doughnut' | 'scatter' | 'radar' | 'bubble' | 'polarArea',
    labels: string,
    values: string,
    fetch: Function,
    reportName:string,
}