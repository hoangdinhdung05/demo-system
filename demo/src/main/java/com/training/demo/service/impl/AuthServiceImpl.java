package com.training.demo.service.impl;

import com.training.demo.dto.request.Auth.LoginRequest;
import com.training.demo.dto.request.Auth.RegisterRequest;
import com.training.demo.dto.response.Auth.AuthResponse;
import com.training.demo.entity.User;
import com.training.demo.exception.BadRequestException;
import com.training.demo.exception.NotFoundException;
import com.training.demo.repository.UserRepository;
import com.training.demo.security.JwtProvider;
import com.training.demo.service.AuthService;
import com.training.demo.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import static com.training.demo.mapper.AuthMapper.toResponse;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtProvider jwtProvider;
    private final UserService userService;

    /**
     * Sử dụng cơ chế Spring Security để tiến hành Authenticate User
     * Sinh accessToken và refreshToken hỗ trợ trong quá trình sử dụng
     *
     * @param request Username(Email)/Password
     * @return AccessToken/RefreshToken
     */
    @Override
    public AuthResponse authenticate(LoginRequest request) {
        log.info("[AuthService] Authenticate user with username: {}", request.getUsername());

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new NotFoundException("User not found"));

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()
                    ));

            SecurityContextHolder.getContext().setAuthentication(authentication);
        } catch (AuthenticationException e) {
            throw new BadRequestException("Username or password incorrect");
        }

        String accessToken = jwtProvider.generatedAccessToken(user);
        String refreshToken = jwtProvider.generateRefreshToken(request.getUsername());

        return toResponse(accessToken, refreshToken);
    }

    /**
     * Đăng kí tài khoản mới (Gán role mặc định cho account là RoleType.User)
     *
     * @param request Thông tin cở bản của Account
     */
    @Override
    public void register(RegisterRequest request) {
        log.info("[AuthService] Register new account with username: {}", request.getUsername());
        userService.register(request);
    }
}
