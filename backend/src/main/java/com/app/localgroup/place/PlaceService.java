package com.app.localgroup.place;

import com.app.localgroup.place.model.Place;
import com.app.localgroup.place.repository.PlaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PlaceService {

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
}
