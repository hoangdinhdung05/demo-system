package com.training.demo.entity;

import com.training.demo.utils.UserStatus;
import jakarta.persistence.*;
import lombok.*;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Entity
@Table(name = "tbl_user")
@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class User extends BaseEntity {

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Column(name = "username", unique = true)
    private String username;

    @Column(name = "email", unique = true)
    private String email;

    @Column(name = "password")
    private String password;

    private UserStatus status;

    @OneToMany(
            cascade = CascadeType.ALL,
            fetch = FetchType.EAGER,
            mappedBy = "user",
            orphanRemoval = true
    )
    @Builder.Default
    private Set<UserHasRole> userHasRoles = new HashSet<>();

    public Set<Role> getRoles() {
        return userHasRoles.stream()
                .map(UserHasRole::getRole)
                .collect(Collectors.toSet());
    }
}
