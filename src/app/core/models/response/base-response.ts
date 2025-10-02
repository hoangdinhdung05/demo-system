export interface BaseResponse<T> {
    success: boolean;
    message: string;
    data: T;
    error?: Record<string, string>;
    timestamp: string;
}