package com.training.demo.exception;

import com.training.demo.dto.response.BaseResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandle {

    // Bắt BaseException do mình custom
    @ExceptionHandler(BaseException.class)
    public ResponseEntity<?> handleBaseException(BaseException ex) {
        log.error("[BaseException] {}", ex.getMessage());

        return ResponseEntity.status(ex.getStatus())
                .body(BaseResponse.failure(
                        ex.getMessage(),
                        ex.getErrors()
                ));
    }

    // Bắt lỗi validate (ví dụ @Valid, @NotBlank,…)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationException(MethodArgumentNotValidException ex) {
        log.error("[ValidationException] {}", ex.getMessage());

        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String field = ((FieldError) error).getField();
            String message = error.getDefaultMessage();
            errors.put(field, message);
        });

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(BaseResponse.failure("Validation failed", errors));
    }

    // Bắt các exception còn lại
    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGlobalException(Exception ex) {
        log.error("[UnhandledException]", ex);

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(BaseResponse.failure("Internal server error", null));
    }
}
