package com.training.demo.service;

import com.training.demo.dto.request.Auth.LoginRequest;
import com.training.demo.dto.request.Auth.LogoutRequest;
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

    /**
     * Sử dụng để get một access và một refresh token mới
     * @param refreshToken refreshToken
     * @return Access/Refresh
     */
    AuthResponse refreshToken(String refreshToken);

    /**
     * Đăng xuất khỏi hệ thổng | Remove
     *
     * @param request Access|Refresh
     */
    void logout(LogoutRequest request);

}
