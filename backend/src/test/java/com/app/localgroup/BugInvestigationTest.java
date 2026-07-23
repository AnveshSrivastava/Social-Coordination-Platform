package com.app.localgroup;

import com.app.localgroup.group.GroupService;
import com.app.localgroup.group.dto.CreateGroupDto;
import com.app.localgroup.group.dto.GroupDto;
import com.app.localgroup.group.model.Group;
import com.app.localgroup.place.PlaceService;
import com.app.localgroup.place.dto.MapPlaceDto;
import com.app.localgroup.place.dto.PlaceDto;
import com.app.localgroup.place.model.Place;
import com.app.localgroup.user.model.User;
import com.app.localgroup.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
@ActiveProfiles("dev")
public class BugInvestigationTest {

    @Autowired
    private GroupService groupService;

    @Autowired
    private PlaceService placeService;

    @Autowired
    private UserRepository userRepository;

    @Test
    public void testBugFlow() {
        System.out.println("--- RUNNING BUG INVESTIGATION TEST ---");

        // 1. Create a user
        User user = User.builder().email("testbug" + System.currentTimeMillis() + "@test.com").phone("+123" + System.currentTimeMillis()).build();
        user = userRepository.save(user);
        System.out.println("User ID: " + user.getId());

        // 2. MapPlaceDto (mimicking frontend request)
        String externalId = "osm-" + System.currentTimeMillis();
        MapPlaceDto mapPlace = MapPlaceDto.builder()
                .name("Runtime Test Cafe")
                .category(Place.Category.CAFE)
                .latitude(28.123)
                .longitude(77.123)
                .externalPlaceId(externalId)
                .build();

        CreateGroupDto createDto = new CreateGroupDto();
        createDto.setMapPlace(mapPlace);
        createDto.setDateTime(Instant.now().plusSeconds(3600));
        createDto.setMaxSize(4);
        createDto.setVisibility(Group.Visibility.PUBLIC);

        // 3. Create Group
        GroupDto group = groupService.createGroup(user.getId(), createDto);
        System.out.println("Group created. Assigned Place ID: " + group.getPlaceId());

        // 4. MapView calls getNearby
        List<Place> nearbyPlaces = placeService.findNearby(28.123, 77.123, 2000);
        System.out.println("findNearby returned " + nearbyPlaces.size() + " places.");
        
        String mapRenderedPlaceId = null;
        for (Place p : nearbyPlaces) {
            if (externalId.equals(p.getExternalPlaceId())) {
                System.out.println("Found our newly created place in getNearby result!");
                System.out.println("ID: " + p.getId());
                System.out.println("Category: " + p.getCategory());
                System.out.println("External ID: " + p.getExternalPlaceId());
                mapRenderedPlaceId = p.getId();
            }
        }

        // 5. PlacePanel calls getGroupsByPlace
        System.out.println("If PlacePanel uses externalId (" + externalId + "):");
        List<GroupDto> byExternal = groupService.getGroupsByPlace(externalId);
        System.out.println("Found groups: " + byExternal.size());

        if (mapRenderedPlaceId != null) {
            System.out.println("If PlacePanel uses Mongo ID (" + mapRenderedPlaceId + "):");
            List<GroupDto> byMongo = groupService.getGroupsByPlace(mapRenderedPlaceId);
            System.out.println("Found groups: " + byMongo.size());
        }

        System.out.println("--- TEST FINISHED ---");
    }
}
