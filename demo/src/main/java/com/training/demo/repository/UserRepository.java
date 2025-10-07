package com.training.demo.repository;

import com.training.demo.dto.response.User.ExportUserResponse;
import com.training.demo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
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

    /**
     * Lấy tất cả người dùng kèm theo vai trò của họ
     * @return Danh sách người dùng với vai trò
     */
    @Query("SELECT u.id AS id, u.firstName AS firstName, u.lastName AS lastName, " +
            "u.username AS username, u.email AS email FROM User u")
    List<ExportUserResponse> findAllWithRoles();

}
