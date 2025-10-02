package com.training.demo.mapper;

import com.training.demo.dto.response.User.UserResponse;
import com.training.demo.entity.User;

public class UserMapper {

    public static UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .status(user.getStatus())
                .verifyEmail(user.isVerifyEmail())
                .build();
    }

}
