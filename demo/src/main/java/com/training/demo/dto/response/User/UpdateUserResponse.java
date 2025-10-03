package com.training.demo.dto.response.User;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UpdateUserResponse {
    private String fistName;
    private String lastName;
}
