export interface ProductRequest {
    name: string;
    description: string;
    price: number;
    quantity: number;
    categoryId: number;
    imageFile?: File;
}