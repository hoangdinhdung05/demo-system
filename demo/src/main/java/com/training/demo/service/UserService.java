package com.training.demo.service;

import com.training.demo.dto.request.Auth.RegisterRequest;
import com.training.demo.dto.request.User.AdminCreateUserRequest;
import com.training.demo.dto.request.User.ChangePasswordRequest;
import com.training.demo.dto.response.System.PageResponse;
import com.training.demo.dto.response.User.UserResponse;

public interface UserService {

    /**
     * Register a new user account.
     *
     * @param request registration details (e.g., email, password, name, etc.)
     */
    void register(RegisterRequest request);

    /**
     * Admin tạo ra account mới
     * @param request thông tin cơ bản account
     */
    void adminCreate(AdminCreateUserRequest request);

    /**
     * Xem thông tin cơ bản user theo id
     * @param id id user cần xem
     * @return Các thông tin cơ bản
     */
    UserResponse getUser(Long id);

    /**
     * Lấy danh sách user có phân trang
     * @param pageNumber trang hiện tại
     * @param pageSize kích thước
     * @return trả về danh sách
     */
    PageResponse<?> getAll(int pageNumber, int pageSize);

    /**
     * User thay đổi mật khẩu của mình
     * @param request Thông tin mật khẩu cũ và mới
     */
    void changePassword(ChangePasswordRequest request);

    /**
     * Admin xóa tài khoản user
     * @param id userId cần xóa
     */
    void deleteUser(Long id);
}
