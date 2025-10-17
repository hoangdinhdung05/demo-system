package com.training.demo.dto.response.Product;

import com.training.demo.dto.response.Category.CategoryResponse;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ProductResponse {
    private Long id;
    private String name;
    private String description;
    private double price;
    private int quantity;
    private String productImageUrl;
    private CategoryResponse category;
}
