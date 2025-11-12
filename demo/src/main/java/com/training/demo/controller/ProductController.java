package com.training.demo.controller;

import com.training.demo.dto.request.Product.ProductCreateRequest;
import com.training.demo.dto.request.Product.ProductRequest;
import com.training.demo.dto.response.System.BaseResponse;
import com.training.demo.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@Slf4j
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    /**
     * Create a new product
     * @param request product request
     * @return created product response
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN')")
    @PostMapping(value = "/create")
    public ResponseEntity<?> createProduct(@RequestBody ProductCreateRequest request) {
        log.info("[Product] Create new product: {}", request.getName());
        return ResponseEntity.ok(BaseResponse.success(productService.createProduct(request)));
    }

    /**
     * Update an existing product
     * @param id product id
     * @param request product request
     * @return updated product response
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN')")
    @PatchMapping("/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @RequestBody ProductRequest request) {
        log.info("[Product] Update product with id: {}", id);
        return ResponseEntity.ok(BaseResponse.success(BaseResponse.success(productService.updateProduct(id, request))));
    }

    /**
     * Delete product by id
     * @param productId product id
     * @return ResponseEntity indicating the result of the delete operation
     */
    @DeleteMapping("/{productId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> deleteProductById(@PathVariable Long productId) {
        log.info("[Product] Delete product with id: {}", productId);
        productService.deleteProductById(productId);
        return ResponseEntity.ok(BaseResponse.success());
    }

    /**
     * Get all products with pagination
     * @param page page number
     * @param size page size
     * @return paginated product responses
     */
    @GetMapping
    public ResponseEntity<?> getAll(@RequestParam(defaultValue = "0") int page,
                                    @RequestParam(defaultValue = "10") int size) {
        log.info("[Product] Get all products");
        return ResponseEntity.ok(BaseResponse.success(productService.getAllProducts(page, size)));
    }

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
    @GetMapping("/search")
    public ResponseEntity<?> search(@RequestParam(required = false) String q,
                                    @RequestParam(required = false) Long categoryId,
                                    @RequestParam(required = false) List<Long> categoryIds,
                                    @RequestParam(required = false) BigDecimal minPrice,
                                    @RequestParam(required = false) BigDecimal maxPrice,
                                    @RequestParam(required = false) Boolean inStock,
                                    @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("[Product] Search products with filters");
        return ResponseEntity.ok(BaseResponse.success(
                productService.search(q, categoryId, categoryIds, minPrice, maxPrice, inStock, pageable)
        ));
    }


    /**
     * Get product by id
     * @param productId product id
     * @return product response
     */
    @GetMapping("/{productId}")
    public ResponseEntity<?> getProductById(@PathVariable Long productId) {
        log.info("[Product] Get product by id: {}", productId);
        return ResponseEntity.ok(BaseResponse.success(productService.getProductById(productId)));
    }

    /**
     * Count total products
     * @return total number of products
     */
    @GetMapping("/count")
    public ResponseEntity<?> countProducts() {
        log.info("[Product] Counting total products");
        return ResponseEntity.ok(BaseResponse.success(productService.countProducts()));
    }

    /**
     * Search products by names
     * @param name product names
     * @return list of product responses matching the names
     */
    @PostMapping("/search")
    public ResponseEntity<?> searchByNames(@RequestParam String name) {
        log.info("[Product] Search products by names");
        return ResponseEntity.ok(BaseResponse.success(productService.findByName(name)));
    }

    @PostMapping("/search-category")
    public ResponseEntity<?> searchByCategory(@RequestParam String name) {
        log.info("[Product] Search products by category");
        return ResponseEntity.ok(BaseResponse.success(productService.findByCategory(name)));
    }
}
