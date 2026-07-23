package com.app.localgroup.user.repository;

import com.app.localgroup.user.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    Optional<User> findByPhone(String phone);

    /**
     * Case-insensitive username lookup for uniqueness enforcement.
     * Usernames are stored lowercase, so this is effectively an exact match
     * after normalization in UserService.
     */
    Optional<User> findByUsername(String username);
}
