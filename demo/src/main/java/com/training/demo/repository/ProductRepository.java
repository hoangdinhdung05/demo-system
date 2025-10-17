package com.training.demo.repository;

import com.training.demo.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

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
}
