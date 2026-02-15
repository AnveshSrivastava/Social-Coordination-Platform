package com.app.localgroup.place.dto;

import com.app.localgroup.place.model.Place;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class PlaceDto {
    private String id;
    private String name;
    private Place.Category category;
    private List<Double> coordinates; // GeoJSON: [lng, lat]
    private List<String> tags;
    private long activeGroupCount;

    // Dynamic place fields
    private String externalPlaceId;     // External API ID (for MAP sources)
    private Double latitude;            // Latitude coordinate (for MAP sources)
    private Double longitude;           // Longitude coordinate (for MAP sources)
    private Place.PlaceSource source;   // Source: INTERNAL or MAP
}

