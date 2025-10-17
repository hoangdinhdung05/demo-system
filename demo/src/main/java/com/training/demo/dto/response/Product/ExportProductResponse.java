package com.training.demo.dto.response.Product;

public interface ExportProductResponse {
    long getId();
    String getName();
    String getDescription();
    double getPrice();
    int getQuantity();
    String getCategoryName();
    String getProductImageUrl();
}
