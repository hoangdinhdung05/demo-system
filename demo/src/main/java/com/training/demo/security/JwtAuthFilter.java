package com.training.demo.security;

import com.training.demo.config.SecurityConfig;
import com.training.demo.exception.TokenException;
import com.training.demo.service.TokenService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.Arrays;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtProvider jwtTokenProvider;
    private final UserDetailsService userDetailsService;
    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        return Arrays.stream(SecurityConfig.PUBLIC_URL)
                .anyMatch(pattern -> pathMatcher.match(pattern, path));
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {
        log.info("======== JwtAuthFilter Running ========");

        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);

            try {
                // validate token
                if (jwtTokenProvider.validateToken(token, true)) {
                    String username = jwtTokenProvider.getUsernameFromToken(token, true);
                    String roles = jwtTokenProvider.getRolesFromToken(token);

                    //load user from DB (UserDetailsService)
                    var userDetails = userDetailsService.loadUserByUsername(username);

                    //build Authentication
                    var auth = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );

                    //set Authentication into context
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            } catch (TokenException ex) {
                log.error("JWT validation failed: {}", ex.getMessage());
                throw ex;
            } catch (Exception ex) {
                log.error("Unexpected error during JWT authentication: {}", ex.getMessage());
                throw new TokenException("Invalid authentication process");
            }
        }
        filterChain.doFilter(request, response);
    }
}
