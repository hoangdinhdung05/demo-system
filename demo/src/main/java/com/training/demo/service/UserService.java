package com.training.demo.service;

import com.training.demo.dto.request.Auth.RegisterRequest;

public interface UserService {

    /**
     * Register a new user account.
     *
     * @param request registration details (e.g., email, password, name, etc.)
     */
    void register(RegisterRequest request);

}
