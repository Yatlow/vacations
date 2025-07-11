import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { VacationType } from "../../../types/VacationType";

interface VacationFormProps {
    mode: "add" | "edit";
    FormClassName: "addVacationForm" | "editVacationForm";
    defaultValues?: Partial<VacationType>;
    onSubmit: (data: any) => void;
    fileRequired?: boolean;
    onCancel?: () => void;
    formMethods: ReturnType<typeof useForm<VacationType>>;
}
function toDateInputValue(date: Date) {
    const local = new Date(date);
    local.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return local.toISOString().split("T")[0];
}

export default function VacationForm({
    mode,
    defaultValues = {},
    onSubmit,
    fileRequired = true,
    onCancel,
    formMethods,
    FormClassName
}: VacationFormProps) {
    const { register, handleSubmit, formState: { errors }, setValue, watch } = formMethods;
    const [state, setState] = useState({ fileSelected: false, previewUrl: "" });

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const startValue = watch("start_time");

    useEffect(() => {
        return () => {
            if (state.previewUrl) {
                URL.revokeObjectURL(state.previewUrl);
            }
        };
    }, [state.previewUrl]);

    useEffect(() => {
        if (defaultValues) {
            Object.entries(defaultValues).forEach(([key, value]) => {
                if (value) setValue(key as keyof VacationType, value);
            });
            if (defaultValues.start_time) setValue("start_time", toDateInputValue(new Date(defaultValues.start_time)));
            if (defaultValues.end_time) setValue("end_time", toDateInputValue(new Date(defaultValues.end_time)));
        }
        if (mode === "add") {
            setValue("start_time", toDateInputValue(now));
            setValue("end_time", toDateInputValue(tomorrow));
        }
    }, []);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className={FormClassName}>
            <div>
                <label>Destination</label>
                <input
                    placeholder="Destination"
                    {...register("destination", { required: true, maxLength: 20 })}
                />
                {errors.destination?.type === "required" && <span>Destination is required</span>}
                {errors.destination?.type === "maxLength" && <span>Max length is 20 characters</span>}
            </div>

            <div>
                <label>Start Date</label>
                <input
                    type="date"
                    {...register("start_time", {
                        required: true,
                        validate: (value) => {
                            if (mode === "add") {
                                const inputDate = new Date(value);
                                inputDate.setHours(0, 0, 0, 0);
                                return inputDate > yesterday || "Start date must be today or later";
                            }
                            return true;
                        }
                    })}
                />
                {errors.start_time && <span>{errors.start_time.message || "Start date is required"}</span>}
            </div>

            <div>
                <label>End Date</label>
                <input
                    type="date"
                    {...register("end_time", {
                        required: true,
                        validate: (value) => {
                            const startDate = new Date(startValue);
                            const endDate = new Date(value);
                            startDate.setHours(0, 0, 0, 0);
                            endDate.setHours(0, 0, 0, 0);
                            return endDate > startDate || "End date must be after start date";
                        }
                    })}
                />
                {errors.end_time && <span>{errors.end_time.message || "End date is required"}</span>}
            </div>

            <div>
                <label>Price</label>
                <input
                    type="number"
                    placeholder="Price"
                    {...register("price", { required: true, min: 1, max: 10000 })}
                />
                {errors.price && <span>Price must be between 1 and 10000</span>}
            </div>

            <div>
                <label>Description</label>
                <textarea
                    placeholder="Description"
                    {...register("description", { required: true, maxLength: 1000 })}
                />
                {errors.description?.type === "required" && <span>Description is required</span>}
                {errors.description?.type === "maxLength" && <span>Description max length is 1000 characters</span>}
            </div>

            <div>
                <label>Photo</label>
                <input
                    type="file"
                    accept="image/*"
                    {...register("picture_url", {
                        ...(fileRequired && { required: true }),
                        onChange: (e) => {
                            const file = e.target.files?.[0];
                            if (state.previewUrl) URL.revokeObjectURL(state.previewUrl);
                            const objectUrl = URL.createObjectURL(file);
                            if (file) setState({ fileSelected: true, previewUrl: objectUrl });
                        }
                    })}
                />
                {fileRequired && errors.picture_url && <span>Photo is required</span>}
            </div>

            {!fileRequired && !state.fileSelected && (
                <span className="fileName">{defaultValues.picture_url}</span>
            )}

            <div className="form-buttons">
                <button type="submit">{mode === "add" ? "Add" : "Save"}</button>
                {mode === "edit" && onCancel && (
                    <button type="button" onClick={onCancel}>Cancel</button>
                )}
            </div>
        </form>
    );
}
