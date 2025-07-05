import { downloadCSV } from "../../../Services/downloadCSV";
import { useEffect, useRef, useState } from "react";
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
Chart.register(ChartDataLabels);
import { useNavigate } from "react-router-dom";
import { setMsg, type AppDispatch } from "../../../Data/ReduxModule";
import { useDispatch } from "react-redux";
import { followersPerDestination } from "../../../reports/followersPerDestination";
import { vacationsPerYear } from "../../../reports/vacationsPerYear";
import type { ReportsDisplayState } from "../../../types/ReportsDisplayState";
import { timeAnalyses } from "../../../reports/time analyses";
import { logout } from "../../../Services/logout";
import loading from "../../../assets/images/loading.png";


export default function Reports() {
    const [state, setState] = useState<ReportsDisplayState>({ err: false, errInfo: "", loading: false, data: [], labels: "", values: "", fetch: () => { }, reportName: "", reportType: "bar" })
    const chartInstance = useRef<Chart | null>(null);
    const chartRef = useRef<HTMLCanvasElement | null>(null);
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const stored = localStorage.getItem("loginData");
    const loginData = stored ? JSON.parse(stored) : "";
    const role = loginData.role;

    useEffect(() => {
        if (role === "user") {
            logout(navigate, dispatch);
            dispatch(setMsg("logging out... access denied"))
        }
        state.fetch(setState, navigate, dispatch);
        if (chartRef.current && state.data.length > 0) {
            if (chartInstance.current) chartInstance.current.destroy();
            chartInstance.current = new Chart(chartRef.current, {
                type: state.reportType,
                data: {
                    labels: state.data.map(row => row.label),
                    datasets: [
                        {
                            label: state.labels,
                            data: state.data.map(row => row.value),
                            backgroundColor: state.reportType === "doughnut" ? ['#fbb987', '#f8ae5c', '#faae3c'] : '#fbb987',
                            borderColor: "#e85d04"
                        }
                    ]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: false
                        },
                        datalabels: {
                            display: state.reportType === "doughnut",
                            color: '#773d1c',
                            font: {
                                size: 10,
                                weight: 'bold'
                            },
                            formatter: (_value, context) => {
                                return context.chart.data.labels?.[context.dataIndex] || '';
                            }
                        }
                    }
                }
            });
        }
    }, [state.fetch, state.data.length]);

    return (
        <>
            <div className="componentBox">
                {role === "user" && <h1>restricted access!</h1>}
                {role === "admin" &&
                    <div>
                        {state.err && <div className="fail">{state.errInfo}</div>}
                        <h1>Reports</h1>
                        <div>
                            {state.loading &&
                                <div className="reportsLoadingBox">
                                    <img src={loading} className="loadingImg" />
                                    <a>loading...</a>
                                </div>}
                            <div>
                                <div className="reportsBtnBox">
                                    <button onClick={() => downloadCSV(state.data, state.reportName, setState, { labels: state.labels, values: state.values })}
                                        className={!state.loading && !state.reportName ? "disabledReportsBtn" : ""}>
                                        Download CSV
                                    </button>
                                    <select defaultValue="" className="reportSelect" onChange={(e) => {
                                        const selected = e.target.value;
                                        const reportMap: { [key: string]: Function } = {
                                            followersPerDestination,
                                            vacationsPerYear,
                                            timeAnalyses,
                                        };
                                        const fetchFn = reportMap[selected];
                                        if (fetchFn) {
                                            setState((prev) => ({ ...prev, loading: true, fetch: fetchFn }));
                                        }
                                    }}>
                                        <option value="" disabled>select report to display</option>
                                        <option value="followersPerDestination">Followers Per Destination</option>
                                        <option value="vacationsPerYear">Vacations Per year</option>
                                        <option value="timeAnalyses">Time Analyses</option>
                                    </select>

                                </div>
                                {state.data.length > 0 && <canvas ref={chartRef} id="acquisitions" className="canvas"></canvas>}
                            </div>

                        </div>
                    </div>}
            </div>
        </>
    );
}
