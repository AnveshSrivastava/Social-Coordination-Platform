package com.app.localgroup.safety.repository;

import com.app.localgroup.safety.model.SafetyEvent;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SafetyEventRepository extends MongoRepository<SafetyEvent, String> {
}
