package com.app.localgroup.group.repository;

import com.app.localgroup.group.model.GroupMember;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroupMemberRepository extends MongoRepository<GroupMember, String> {
    List<GroupMember> findByGroupId(String groupId);
    List<GroupMember> findByUserId(String userId);
}
