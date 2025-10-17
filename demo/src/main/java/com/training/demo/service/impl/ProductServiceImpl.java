package com.training.demo.service.impl;

import com.training.demo.dto.request.Product.ProductRequest;
import com.training.demo.dto.response.Product.ProductResponse;
import com.training.demo.dto.response.System.PageResponse;
import com.training.demo.entity.Category;
import com.training.demo.entity.Product;
import com.training.demo.exception.BadRequestException;
import com.training.demo.repository.CategoryRepository;
import com.training.demo.repository.ProductRepository;
import com.training.demo.service.FileService;
import com.training.demo.service.ProductService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import static com.training.demo.mapper.ProductMapper.toProductResponse;

@Service
@Slf4j
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final FileService fileService;

    /**
     * Get product by id
     *
     * @param productId product id
     * @return product response
     */
    @Override
    public ProductResponse getProductById(Long productId) {
        log.info("[ProductService] Getting product by id: {}", productId);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new BadRequestException("Product with id " + productId + " does not exist"));

        return toProductResponse(product);
    }

    /**
     * Create a new product
     *
     * @param request product request
     * @return created product response
     */
    @Override
    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        log.info("[ProductService] Creating product with name: {}", request.getName());
        validateForCreate(request);

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new BadRequestException("Category with id " + request.getCategoryId() + " does not exist"));

        if (productRepository.existsByName(request.getName().trim())) {
            throw new BadRequestException("Product with name " + request.getName() + " already exists");
        }

        // 1) Upload ảnh -> lấy URL (String)
        String imageUrl;
        try {
            imageUrl = fileService
                    .upload(com.training.demo.utils.enums.UploadKind.PRODUCT_IMAGE, request.getImageFile())
                    .getPublicUrl();
        } catch (Exception e) {
            throw new BadRequestException("Failed to upload product image: " + e.getMessage());
        }

        // 2) Tạo entity với imageUrl
        Product product = buildProduct(request, category, imageUrl);

        product = productRepository.save(product);
        log.info("[ProductService] Created product id={}", product.getId());
        return toProductResponse(product);
    }

    /**
     * Update an existing product
     *
     * @param request product request
     * @return updated product response
     */
    @Override
    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        log.info("[ProductService] Updating product id={} with name: {}", id, request.getName());

        validateForUpdate(request);

        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Product with id " + id + " does not exist"));

        // Check duplicate name (if name changed)
        if (request.getName() != null
                && !request.getName().trim().equalsIgnoreCase(existing.getName())
                && productRepository.existsByName(request.getName().trim())) {
            throw new BadRequestException("Product with name " + request.getName() + " already exists");
        }

        // Validate category (if changed / provided)
        Category category = existing.getCategory();
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new BadRequestException("Category with id " + request.getCategoryId() + " does not exist"));
        }

        // Apply changes
        if (request.getName() != null) {
            existing.setName(request.getName().trim());
        }
        if (request.getDescription() != null) {
            existing.setDescription(request.getDescription());
        }
        if (request.getPrice() != null) {
            existing.setPrice(request.getPrice());
        }
        if (request.getQuantity() != null) {
            existing.setQuantity(request.getQuantity());
        }
        existing.setCategory(category);

        //Update image if provided
        if (request.getImageFile() != null && !request.getImageFile().isEmpty()) {
            // Delete old image
            String oldImageUrl = existing.getProductImageUrl();
            try {
                fileService.deleteByPublicUrl(oldImageUrl);
            } catch (Exception e) {
                log.error("[ProductService] Failed to delete old product image at URL: {}", oldImageUrl);
            }

            // Upload new image
            String newImageUrl;
            try {
                newImageUrl = fileService
                        .upload(com.training.demo.utils.enums.UploadKind.PRODUCT_IMAGE, request.getImageFile())
                        .getPublicUrl();
            } catch (Exception e) {
                throw new BadRequestException("Failed to upload new product image: " + e.getMessage());
            }
            existing.setProductImageUrl(newImageUrl);
        }

        Product saved = productRepository.save(existing);
        log.info("[ProductService] Updated product id={}", saved.getId());
        return toProductResponse(saved);
    }

    /**
     * Delete product by id
     *
     * @param productId product id
     */
    @Override
    @Transactional
    public void deleteProductById(Long productId) {
        log.info("[ProductService] Deleting product id={}", productId);

        Product  product = productRepository.findById(productId)
                .orElseThrow(() -> new BadRequestException("Product with id " + productId + " does not exist"));

        String publicUrl = product.getProductImageUrl();

        try {
            fileService.deleteByPublicUrl(publicUrl);
        } catch (Exception e) {
            log.error("[ProductService] Failed to delete product image at URL: {}", publicUrl);
        }

        productRepository.deleteById(productId);
        log.info("[ProductService] Deleted product id={}", productId);
    }


    /**
     * Get all products with pagination
     *
     * @param page page number
     * @param size page size
     * @return paginated product responses
     */
    @Override
    public PageResponse<?> getAllProducts(int page, int size) {
        if (page < 0) throw new BadRequestException("Page index must be >= 0");
        if (size <= 0 || size > 200) throw new BadRequestException("Page size must be in range [1, 200]");

        var pageable = org.springframework.data.domain.PageRequest.of(
                page, size,
                org.springframework.data.domain.Sort.by(Sort.Direction.ASC, "createdAt")
                        .and(org.springframework.data.domain.Sort.by("id"))
        );

        var productPage = productRepository.findAll(pageable);
        var items = productPage.getContent()
                .stream()
                .map(com.training.demo.mapper.ProductMapper::toProductResponse)
                .toList();

        return PageResponse.<ProductResponse>builder()
                .pageNumber(page)
                .pageSize(size)
                .totalElements(productPage.getTotalElements())
                .totalPages(productPage.getTotalPages())
                .content(items)
                .build();
    }

    /**
     * Count total products
     *
     * @return total number of products
     */
    @Override
    public long countProducts() {
        log.info("[ProductService] Counting total products");
        return productRepository.count();
    }

    /**
     * Check if any product exists by category ID
     *
     * @param categoryId category ID
     * @return true if any product exists with the given category ID, false otherwise
     */
    @Override
    public boolean existsByCategoryId(Long categoryId) {
        log.info("[ProductService] Checking existence of products with category id={}", categoryId);
        return productRepository.existsByCategoryId(categoryId);
    }

    //========== PRIVATE METHOD ==========//
    private void validateForCreate(ProductRequest req) {
        if (req == null) throw new BadRequestException("Request body must not be null");
        if (req.getName() == null || req.getName().isBlank())
            throw new BadRequestException("Product name must not be blank");
        if (req.getPrice() == null || req.getPrice() < 0)
            throw new BadRequestException("Price must be >= 0");
        if (req.getQuantity() == null || req.getQuantity() < 0)
            throw new BadRequestException("Quantity must be >= 0");
        if (req.getCategoryId() == null)
            throw new BadRequestException("Category id must not be null");
        if (req.getImageFile() == null || req.getImageFile().isEmpty())
            throw new BadRequestException("Product image file must not be null");
    }

    private void validateForUpdate(ProductRequest req) {
        if (req == null) throw new BadRequestException("Request body must not be null");
        if (req.getName() != null && req.getName().isBlank())
            throw new BadRequestException("Product name must not be blank");
        if (req.getPrice() != null && req.getPrice() < 0)
            throw new BadRequestException("Price must be >= 0");
        if (req.getQuantity() != null && req.getQuantity() < 0)
            throw new BadRequestException("Quantity must be >= 0");
    }

    private static Product buildProduct(ProductRequest request, Category category, String imageUrl) {
        return Product.builder()
                .name(request.getName().trim())
                .description(request.getDescription())
                .price(request.getPrice())
                .quantity(request.getQuantity())
                .productImageUrl(imageUrl)
                .category(category)
                .build();
    }
}
