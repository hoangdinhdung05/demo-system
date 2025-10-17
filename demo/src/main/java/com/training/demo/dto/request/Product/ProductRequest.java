package com.training.demo.dto.request.Product;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Getter @Setter
public class ProductRequest {

    @NotBlank(message = "Product name must not be blank", groups = OnCreate.class)
    private String name;

    private String description;

    @NotNull(message = "Product price must not be null", groups = OnCreate.class)
    @DecimalMin(value = "0.0", inclusive = true, message = "Price must be >= 0")
    private Double price;

    @NotNull(message = "Product quantity must not be null", groups = OnCreate.class)
    @Min(value = 0, message = "Quantity must be >= 0")
    private Integer quantity;

    @NotNull(message = "Category id must not be null", groups = OnCreate.class)
    private Long categoryId;

    @NotNull(message = "Product image file must not be null", groups = OnCreate.class)
    private MultipartFile imageFile;

    public interface OnCreate {}
    public interface OnUpdate {}
}
