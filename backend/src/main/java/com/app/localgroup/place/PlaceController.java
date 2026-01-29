package com.app.localgroup.place;

import com.app.localgroup.common.ApiResponse;
import com.app.localgroup.place.dto.PlaceDto;
import com.app.localgroup.place.model.Place;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/places")
@RequiredArgsConstructor
@Validated
public class PlaceController {

    private final PlaceService placeService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PlaceDto>>> list(@RequestParam(name = "category", required = false) Optional<Place.Category> category) {
        List<Place> places = placeService.findAll(category);
        List<PlaceDto> dtos = places.stream().map(p -> PlaceDto.builder()
                .id(p.getId())
                .name(p.getName())
                .category(p.getCategory())
                .coordinates(p.getGeoLocation() != null ? List.of(p.getGeoLocation().getX(), p.getGeoLocation().getY()) : null)
                .tags(p.getTags())
                .activeGroupCount(placeService.activeGroupCount(p.getId()))
                .build()).toList();
        return ResponseEntity.ok(ApiResponse.<List<PlaceDto>>builder().success(true).data(dtos).message("OK").build());
    }

    @GetMapping("/{id}")
        public ResponseEntity<ApiResponse<PlaceDto>> get(@PathVariable String id) {
        return placeService.findById(id)
            .map(p -> PlaceDto.builder()
                .id(p.getId())
                .name(p.getName())
                .category(p.getCategory())
                .coordinates(p.getGeoLocation() != null ? List.of(p.getGeoLocation().getX(), p.getGeoLocation().getY()) : null)
                .tags(p.getTags())
                .activeGroupCount(placeService.activeGroupCount(p.getId()))
                .build())
            .map(d -> ResponseEntity.ok(ApiResponse.<PlaceDto>builder().success(true).data(d).message("OK").build()))
            .orElseGet(() -> ResponseEntity.status(404).body(ApiResponse.<PlaceDto>builder().success(false).message("Place not found").build()));
    }

    @GetMapping("/nearby")
    public ResponseEntity<ApiResponse<List<PlaceDto>>> nearby(@RequestParam @NotNull double lat,
                                                           @RequestParam @NotNull double lng,
                                                           @RequestParam(name = "radius", defaultValue = "1000") double radius) {
        List<Place> places = placeService.findNearby(lat, lng, radius);
        List<PlaceDto> dtos = places.stream().map(p -> PlaceDto.builder()
            .id(p.getId())
            .name(p.getName())
            .category(p.getCategory())
            .coordinates(p.getGeoLocation() != null ? List.of(p.getGeoLocation().getX(), p.getGeoLocation().getY()) : null)
            .tags(p.getTags())
            .activeGroupCount(placeService.activeGroupCount(p.getId()))
            .build()).toList();
        return ResponseEntity.ok(ApiResponse.<List<PlaceDto>>builder().success(true).data(dtos).message("OK").build());
    }
}
