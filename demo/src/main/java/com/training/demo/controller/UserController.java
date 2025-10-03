package com.training.demo.controller;

import com.training.demo.dto.request.User.AdminCreateUserRequest;
import com.training.demo.dto.request.User.ChangePasswordRequest;
import com.training.demo.dto.response.System.BaseResponse;
import com.training.demo.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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
    @GetMapping("/{id}")
    public ResponseEntity<?> getUser(@PathVariable Long id) {
        log.info("[User] Get user by userId: {}", id);
        return ResponseEntity.ok(BaseResponse.success(userService.getUser(id)));
    }

    /**
     * Lấy list user có phân trang
     * @param pageNumber Trang hiện tại
     * @param pageSize Kích thước trang
     * @return Trả về danh sách user
     */
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> getAllUsers(
            @RequestParam(name = "pageNumber", defaultValue = "0") int pageNumber,
            @RequestParam(name = "pageSize", defaultValue = "10") int pageSize) {
        log.info("[User] Get all users - pageNumber: {}, pageSize: {}", pageNumber, pageSize);
        return ResponseEntity.ok(BaseResponse.success(userService.getAll(pageNumber, pageSize)));
    }

    /**
     * User thay đổi mật khẩu của mình
     * @param request Thông tin mật khẩu cũ và mới
     */
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody @Valid ChangePasswordRequest request) {
        log.info("[User] Change password for user");
        userService.changePassword(request);
        return ResponseEntity.ok(BaseResponse.success());
    }

    /**
     * Admin xóa tài khoản user
     * @param id userId cần xóa
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        log.info("[User] Delete user by userId: {}", id);
        userService.deleteUser(id);
        return ResponseEntity.ok(BaseResponse.success());
    }

    /**
     * Admin tạo ra account mới
     * @param request thông tin cơ bản account
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN')")
    @PostMapping
    public ResponseEntity<?> adminCreateUser(@RequestBody @Valid AdminCreateUserRequest request) {
        log.info("[User] Admin create new user with username: {}", request.getUsername());
        userService.adminCreate(request);
        return ResponseEntity.ok(BaseResponse.success());
    }

    /**
     * Admin tìm kiếm user với nhiều bộ lọc khác nhau
     *
     * @param filters  các bộ lọc
     * @param pageable thông tin phân trang
     * @return danh sách user
     */
    @GetMapping("/filter")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> getUsers(
            @RequestParam Map<String, String> filters,
            @PageableDefault(page = 0, size = 10, sort = "id", direction = Sort.Direction.ASC) Pageable pageable) {

        log.info("[User] Admin search users with filters: {}, pageable: {}", filters, pageable);

        Map<String, String> realFilters = filters.entrySet().stream()
                .filter(entry -> !List.of("page", "size", "sort").contains(entry.getKey()))
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));

        return ResponseEntity.ok(BaseResponse.success(userService.searchUsersForAdmin(realFilters, pageable)));
    }

}
