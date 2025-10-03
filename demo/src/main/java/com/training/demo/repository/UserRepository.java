package com.training.demo.repository;

import com.training.demo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {

    /**
     * Tìm người dùng theo tên đăng nhập
     * @param username username của người dùng
     * @return Optional<User> nếu tìm thấy, Optional.empty() nếu không tìm thấy
     */
    Optional<User> findByUsername(String username);

    /**
     * Tìm người dùng theo email
     * @param email email của người dùng
     * @return Optional<User> </User>
     */
    Optional<User> findByEmail(String email);

    /**
     * Check username exists
     * @param username username request
     * @return TRUE OR FALSE
     */
    boolean existsByUsername(String username);

    /**
     * Check email exists
     * @param email email request
     * @return TRUE OR FALSE
     */
    boolean existsByEmail(String email);

}
