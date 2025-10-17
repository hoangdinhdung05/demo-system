package com.training.demo.repository;

import com.training.demo.dto.response.Product.ExportProductResponse;
import com.training.demo.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product,Long> {

    /**
     * Check if a product exists by name
     * @param name product name
     * @return true if exists, false otherwise
     */
    boolean existsByName(String name);

    /**
     * Check if any product exists by category ID
     * @param categoryId category ID
     * @return true if any product exists with the given category ID, false otherwise
     */
    boolean existsByCategoryId(Long categoryId);

    /**
     * Get all products with their category names
     * @return List of ExportProductResponse
     */
    @Query("""
    SELECT p.id AS id,
           p.name AS name,
           p.description AS description,
           p.price AS price,
           p.quantity AS quantity,
           c.name AS categoryName,
           p.productImageUrl AS productImageUrl
    FROM Product p
    JOIN p.category c
    ON p.category.id = c.id
    """)
    List<ExportProductResponse> findAllProjectedWithCategory();
}
