package com.training.demo.service;

import com.training.demo.dto.request.Auth.RegisterRequest;
import com.training.demo.dto.response.User.UserResponse;

public interface UserService {

    /**
     * Register a new user account.
     *
     * @param request registration details (e.g., email, password, name, etc.)
     */
    void register(RegisterRequest request);

    /**
     * Xem thông tin cơ bản user theo id
     * @param id id user cần xem
     * @return Các thông tin cơ bản
     */
    UserResponse getUserById(Long id);

}
