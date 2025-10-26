package com.training.demo.service;

import com.training.demo.dto.request.Product.ProductRequest;
import com.training.demo.dto.response.Product.ProductResponse;
import com.training.demo.dto.response.System.PageResponse;
import org.springframework.data.domain.Pageable;
import java.math.BigDecimal;
import java.util.List;

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
     * Search products with filters and pagination
     * @param q search keyword
     * @param categoryId category ID filter
     * @param categoryIds list of category IDs filter
     * @param minPrice minimum price filter
     * @param maxPrice maximum price filter
     * @param inStock stock availability filter
     * @param pageable pagination information
     * @return paginated product responses matching the search criteria
     */
    PageResponse<?> search(String q,
                           Long categoryId,
                           List<Long> categoryIds,
                           BigDecimal minPrice,
                           BigDecimal maxPrice,
                           Boolean inStock,
                           Pageable pageable);

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
