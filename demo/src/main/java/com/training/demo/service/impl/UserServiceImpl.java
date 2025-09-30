package com.training.demo.service.impl;

import com.training.demo.dto.request.Auth.RegisterRequest;
import com.training.demo.entity.Role;
import com.training.demo.entity.User;
import com.training.demo.entity.UserHasRole;
import com.training.demo.exception.BadRequestException;
import com.training.demo.exception.NotFoundException;
import com.training.demo.repository.RoleRepository;
import com.training.demo.repository.UserRepository;
import com.training.demo.service.UserService;
import com.training.demo.utils.RoleType;
import com.training.demo.utils.UserStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;


    /**
     * Register a new user account.
     *
     * @param request registration details (e.g., email, password, name, etc.)
     */
    @Transactional
    @Override
    public void register(RegisterRequest request) {
        log.info("Registering new user account");

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username already exists");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already exists");
        }

        Role role = roleRepository.findByName(RoleType.USER)
                .orElseThrow(() -> new NotFoundException("Role user not found"));

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail().toLowerCase())
                .password(passwordEncoder.encode(request.getPassword()))
                .status(UserStatus.ACTIVE)
                .build();

        UserHasRole userHasRole = UserHasRole.builder()
                .user(user)
                .role(role)
                .build();

        user.getUserHasRoles().add(userHasRole);

        userRepository.save(user);
        log.info("Registered new account successfully with username: {}", request.getUsername());
    }
}
