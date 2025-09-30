package com.training.demo.dto.request.Auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class RegisterRequest {

    @NotBlank(message = "Username not null")
    private String username;

    @NotBlank(message = "Email not null")
    private String email;

    @NotBlank(message = "Password not null")
    private String password;
}
