export function downloadCSV(
    data: object[],
    filename: string,
    setState: React.Dispatch<React.SetStateAction<any>>,
    header: { labels: string, values: string }
) {
    if (!filename){
        return
    }
    if (!data || !data.length) {
        setState((prev: any) => ({
            ...prev,
            err: true,
            errInfo: "failed to download"
        }));
        return;
    };



    header.labels = header.labels[0].toUpperCase() + header.labels.slice(1);
    header.values = header.values[0].toUpperCase() + header.values.slice(1);
    const csvRows = [
        Object.values(header).join(","),
        ...data.map(row => Object.values(row).join(","))
    ];

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}
