package com.training.demo.service;

import com.training.demo.dto.request.Product.ProductRequest;
import com.training.demo.dto.response.Product.ProductResponse;
import com.training.demo.dto.response.System.PageResponse;

public interface ProductService {

    /**
     * Get product by id
     * @param productId product id
     * @return product response
     */
    ProductResponse getProductById(Long productId);

    /**
     * Create a new product
     * @param request product request
     * @return created product response
     */
    ProductResponse createProduct(ProductRequest request);

    /**
     * Update an existing product
     * @param request product request
     * @return updated product response
     */
    ProductResponse updateProduct(Long id, ProductRequest request);

    /**
     * Delete product by id
     * @param productId product id
     */
    void deleteProductById(Long productId);

    /**
     * Get all products with pagination
     * @param page page number
     * @param size page size
     * @return paginated product responses
     */
    PageResponse<?> getAllProducts(int page, int size);

    /**
     * Count total products
     * @return total number of products
     */
    long countProducts();

    /**
     * Check if any product exists by category ID
     * @param categoryId category ID
     * @return true if any product exists with the given category ID, false otherwise
     */
    boolean existsByCategoryId(Long categoryId);
}
