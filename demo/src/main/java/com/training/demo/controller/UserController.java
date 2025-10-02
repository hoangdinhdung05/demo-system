package com.training.demo.controller;

import com.training.demo.dto.response.BaseResponse;
import com.training.demo.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
@Validated
public class UserController {

    private final UserService userService;

    /**
     * Api get user info by userId
     * @param id userId cần get
     * @return Trả về thông tin cơ bản user
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<?> getUser(@PathVariable Long id) {
        log.info("[User] Get user by userId: {}", id);
        return ResponseEntity.ok(BaseResponse.success(userService.getUserById(id)));
    }
}
