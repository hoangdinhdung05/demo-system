package com.training.demo.service;

import com.training.demo.dto.request.Auth.LoginRequest;
import com.training.demo.dto.request.Auth.RegisterRequest;
import com.training.demo.dto.response.Auth.AuthResponse;

public interface AuthService {

    /**
     * Sử dụng cơ chế Spring Security để tiến hành Authenticate User
     * Sinh accessToken và refreshToken hỗ trợ trong quá trình sử dụng
     *
     * @param request Username(Email)/Password
     * @return AccessToken/RefreshToken
     */
    AuthResponse authenticate(LoginRequest request);

    /**
     * Đăng kí tài khoản mới (Gán role mặc định cho account là RoleType.User)
     * @param request Thông tin cở bản của Account
     */
    void register(RegisterRequest request);

}
