export type VacationType={
    id:string|number;
    destination: string;
    start_time: string | Date;
    end_time: string | Date;
    price: string;
    picture_url: string;
    description: string;
}