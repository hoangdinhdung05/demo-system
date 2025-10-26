package com.training.demo.dto.response.Product;

import com.training.demo.dto.response.Category.CategoryResponse;
import lombok.Builder;
import lombok.Getter;
import java.math.BigDecimal;

@Getter
@Builder
public class ProductResponse {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private int quantity;
    private String productImageUrl;
    private CategoryResponse category;
}
