package com.app.localgroup;

import com.app.localgroup.group.GroupLifecycleScheduler;
import com.app.localgroup.group.GroupService;
import com.app.localgroup.group.dto.CreateGroupDto;
import com.app.localgroup.group.dto.GroupDto;
import com.app.localgroup.group.model.Group;
import com.app.localgroup.place.dto.MapPlaceDto;
import com.app.localgroup.place.model.Place;
import com.app.localgroup.user.model.User;
import com.app.localgroup.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.Instant;
import java.util.List;

@SpringBootTest
@ActiveProfiles("dev")
public class SchedulerBugTest {

    @Autowired
    private GroupService groupService;

    @Autowired
    private GroupLifecycleScheduler scheduler;

    @Autowired
    private UserRepository userRepository;

    @Test
    public void testSchedulerBug() {
        System.out.println("--- RUNNING SCHEDULER BUG TEST ---");

        // 1. Create a user
        User user = User.builder().email("testsch" + System.currentTimeMillis() + "@test.com").phone("+123" + System.currentTimeMillis()).build();
        user = userRepository.save(user);

        // 2. Create Group 12 hours from now
        MapPlaceDto mapPlace = MapPlaceDto.builder()
                .name("Scheduler Test Cafe")
                .category(Place.Category.CAFE)
                .latitude(28.123)
                .longitude(77.123)
                .externalPlaceId("osm-sch-" + System.currentTimeMillis())
                .build();

        CreateGroupDto createDto = new CreateGroupDto();
        createDto.setMapPlace(mapPlace);
        createDto.setDateTime(Instant.now().plusSeconds(12 * 3600)); // 12 hours from now
        createDto.setMaxSize(4);
        createDto.setVisibility(Group.Visibility.PUBLIC);

        GroupDto group = groupService.createGroup(user.getId(), createDto);
        System.out.println("Group created with status: JOINABLE. Place ID: " + group.getPlaceId());

        // 3. PlacePanel fetches groups BEFORE scheduler
        List<GroupDto> before = groupService.getGroupsByPlace(group.getPlaceId());
        System.out.println("Groups returned BEFORE scheduler: " + before.size());

        // 4. Manually trigger scheduler
        System.out.println("Triggering scheduler...");
        scheduler.run();

        // 5. PlacePanel fetches groups AFTER scheduler
        List<GroupDto> after = groupService.getGroupsByPlace(group.getPlaceId());
        System.out.println("Groups returned AFTER scheduler: " + after.size());

        System.out.println("--- TEST FINISHED ---");
    }
}
