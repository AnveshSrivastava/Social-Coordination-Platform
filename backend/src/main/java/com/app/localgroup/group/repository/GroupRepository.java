package com.app.localgroup.group.repository;

import com.app.localgroup.group.model.Group;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroupRepository extends MongoRepository<Group, String> {
    List<Group> findByCreatorIdAndStatusNot(String creatorId, Group.Status status);
}
