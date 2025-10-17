package com.training.demo.controller;

import com.training.demo.dto.request.Product.ProductRequest;
import com.training.demo.dto.response.System.BaseResponse;
import com.training.demo.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

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
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createProduct(@ModelAttribute ProductRequest request) {
        return ResponseEntity.ok(productService.createProduct(request));
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
        return ResponseEntity.ok(BaseResponse.success(productService.updateProduct(id, request)));
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
                                              @RequestParam(defaultValue = "10") int size) {        log.info("[Product] Get all products");
        return ResponseEntity.ok(BaseResponse.success(productService.getAllProducts(page, size)));
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
}
