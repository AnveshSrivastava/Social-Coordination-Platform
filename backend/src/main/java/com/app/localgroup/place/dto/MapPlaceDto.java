package com.app.localgroup.place.dto;

import com.app.localgroup.place.model.Place;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for creating groups from map-selected locations.
 * Represents external place data from map APIs (Google Places, OSM, etc).
 * 
 * Validation Rules:
 * - For MAP sources: externalPlaceId, latitude, longitude must be non-null
 * - name and category are always required
 * - source defaults to MAP if not specified
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MapPlaceDto {

    @NotBlank(message = "Place name is required")
    private String name;

    @NotNull(message = "Category is required")
    private Place.Category category;

    @NotNull(message = "Latitude is required for map places")
    private Double latitude;

    @NotNull(message = "Longitude is required for map places")
    private Double longitude;

    @NotBlank(message = "External place ID is required for map places")
    private String externalPlaceId;

    @Builder.Default
    private Place.PlaceSource source = Place.PlaceSource.MAP;
}
