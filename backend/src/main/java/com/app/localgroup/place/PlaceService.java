package com.app.localgroup.place;

import com.app.localgroup.place.dto.MapPlaceDto;
import com.app.localgroup.place.dto.PlaceDto;
import com.app.localgroup.place.model.Place;
import com.app.localgroup.place.repository.PlaceRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PlaceService {

    private static final Logger log = LoggerFactory.getLogger(PlaceService.class);

    private final PlaceRepository placeRepository;

    public List<Place> findAll(Optional<Place.Category> category) {
        if (category.isPresent()) return placeRepository.findByCategory(category.get());
        return placeRepository.findAll();
    }

    public Optional<Place> findById(String id) {
        return placeRepository.findById(id);
    }

    /**
     * Find places within radius meters of the given location using MongoDB $nearSphere geo query.
     * Uses the 2dsphere index on geoLocation field for efficient spatial queries.
     * 
     * @param lat latitude of center point
     * @param lng longitude of center point
     * @param radiusMeters search radius in meters
     * @return List of places within the specified radius, sorted by distance
     */
    public List<Place> findNearby(double lat, double lng, double radiusMeters) {
        // MongoDB $nearSphere expects coordinates in [lng, lat] order (GeoJSON standard)
        return placeRepository.findNearby(lng, lat, radiusMeters);
    }

    public long activeGroupCount(String placeId) {
        // Placeholder: real implementation would query GroupRepository
        return 0L;
    }

    /**
     * Find or create a place from map selection.
     * 
     * First checks if place with the same externalPlaceId and MAP source already exists.
     * If found, returns existing place (prevents duplicates).
     * If not found, creates and returns new place.
     * 
     * @param mapPlace Map place data from frontend
     * @return Place ID (either existing or newly created)
     * 
     * Non-negotiable rules:
     * - Only MAP source places are created here
     * - Existing INTERNAL places are never modified
     * - No external API calls made; frontend data is trusted
     */
    public String findOrCreateMapPlace(MapPlaceDto mapPlace) {
        // Try to find existing place by externalPlaceId + MAP source
        Optional<Place> existing = placeRepository.findByExternalPlaceIdAndSource(
            mapPlace.getExternalPlaceId(),
            Place.PlaceSource.MAP
        );

        if (existing.isPresent()) {
            log.info("Reused map place: externalId={} placeId={}", 
                mapPlace.getExternalPlaceId(), existing.get().getId());
            return existing.get().getId();
        }

        // Create new place from map data
        Place newPlace = Place.builder()
            .name(mapPlace.getName())
            .category(mapPlace.getCategory())
            .externalPlaceId(mapPlace.getExternalPlaceId())
            .latitude(mapPlace.getLatitude())
            .longitude(mapPlace.getLongitude())
            .source(Place.PlaceSource.MAP)
            // Create GeoJSON Point for spatial indexing (lng, lat order per GeoJSON spec)
            .geoLocation(new GeoJsonPoint(mapPlace.getLongitude(), mapPlace.getLatitude()))
            .build();

        Place saved = placeRepository.save(newPlace);
        log.info("Created new map place: externalId={} placeId={}", 
            mapPlace.getExternalPlaceId(), saved.getId());
        
        return saved.getId();
    }

    /**
     * Convert a Place entity to PlaceDto for API responses.
     * Includes all new dynamic place fields (externalPlaceId, latitude, longitude, source).
     * Handles GeoJsonPoint conversion to lat/lng coordinates.
     * 
     * @param place The Place entity to convert
     * @return PlaceDto with all fields populated
     */
    public PlaceDto toDto(Place place) {
        return PlaceDto.builder()
            .id(place.getId())
            .name(place.getName())
            .category(place.getCategory())
            .coordinates(place.getGeoLocation() != null 
                ? List.of(place.getGeoLocation().getX(), place.getGeoLocation().getY()) 
                : null)
            .tags(place.getTags())
            .activeGroupCount(activeGroupCount(place.getId()))
            .externalPlaceId(place.getExternalPlaceId())
            .latitude(place.getLatitude())
            .longitude(place.getLongitude())
            .source(place.getSource())
            .build();
    }
}
