export interface BaseResponse<T> {
    success: boolean;
    message: string;
    data: T;
    error: Object;
    timestamp: string;
}