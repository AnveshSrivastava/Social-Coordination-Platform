package com.app.localgroup.group;

import com.app.localgroup.common.ApiResponse;
import com.app.localgroup.group.dto.CreateGroupDto;
import com.app.localgroup.group.dto.GroupDto;
import com.app.localgroup.group.dto.UpdateGroupDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/groups")
@RequiredArgsConstructor
public class GroupController {

    private static final Logger log = LoggerFactory.getLogger(GroupController.class);

    private final GroupService groupService;

    @PostMapping
    public ResponseEntity<ApiResponse<GroupDto>> create(@Valid @RequestBody CreateGroupDto dto, Authentication auth) {
        String userId = (String) auth.getPrincipal();
        GroupDto g = groupService.createGroup(userId, dto);
        return ResponseEntity
                .ok(ApiResponse.<GroupDto>builder().success(true).data(g).message("Group created").build());
    }

    @PostMapping("/{groupId}/join")
    public ResponseEntity<ApiResponse<String>> join(@PathVariable("groupId") String groupId, Authentication auth) {
        String userId = (String) auth.getPrincipal();
        groupService.joinGroup(userId, groupId);
        return ResponseEntity.ok(ApiResponse.<String>builder().success(true).message("Join requested").build());
    }

    @PostMapping("/{groupId}/join-private")
    public ResponseEntity<ApiResponse<String>> joinPrivate(@PathVariable("groupId") String groupId,
            @RequestParam("inviteCode") String inviteCode, Authentication auth) {
        String userId = (String) auth.getPrincipal();
        groupService.joinPrivate(userId, groupId, inviteCode);
        return ResponseEntity.ok(ApiResponse.<String>builder().success(true).message("Join requested").build());
    }

    @PostMapping("/{groupId}/leave")
    public ResponseEntity<ApiResponse<String>> leave(@PathVariable("groupId") String groupId, Authentication auth) {
        String userId = (String) auth.getPrincipal();
        groupService.leaveGroup(userId, groupId);
        return ResponseEntity.ok(ApiResponse.<String>builder().success(true).message("Left group").build());
    }

    @PostMapping("/{groupId}/confirm")
    public ResponseEntity<ApiResponse<GroupDto>> confirm(@PathVariable("groupId") String groupId, Authentication auth) {
        String userId = (String) auth.getPrincipal();
        groupService.confirmAttendance(userId, groupId);
        GroupDto updated = groupService.getGroupById(groupId, userId);
        return ResponseEntity.ok(ApiResponse.<GroupDto>builder().success(true).data(updated).message("Attendance confirmed").build());
    }

    @PutMapping("/{groupId}/update")
    public ResponseEntity<ApiResponse<GroupDto>> updateGroup(@PathVariable("groupId") String groupId,
            @RequestBody UpdateGroupDto dto,
            Authentication auth) {
        String userId = (String) auth.getPrincipal();
        GroupDto updated = groupService.updateGroup(userId, groupId, dto);
        return ResponseEntity.ok(ApiResponse.<GroupDto>builder().success(true).data(updated).message("Group updated").build());
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<List<GroupDto>>> getMyGroups(Authentication auth) {
        String userId = (String) auth.getPrincipal();
        return ResponseEntity.ok(ApiResponse.<List<GroupDto>>builder()
                .success(true)
                .data(groupService.getMyGroups(userId))
                .message("OK")
                .build());
    }

    @GetMapping("/place/{placeId}")
    public ResponseEntity<ApiResponse<List<GroupDto>>> getByPlace(@PathVariable("placeId") String placeId) {
        return ResponseEntity.ok(ApiResponse.<List<GroupDto>>builder()
                .success(true)
                .data(groupService.getGroupsByPlace(placeId))
                .message("OK")
                .build());
    }
}
