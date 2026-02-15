package com.app.localgroup.place.repository;

import com.app.localgroup.place.model.Place;
import com.app.localgroup.place.model.Place.Category;
import com.app.localgroup.place.model.Place.PlaceSource;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlaceRepository extends MongoRepository<Place, String> {
    List<Place> findByCategory(Category category);
    
    /**
     * Find places within radius meters of the given point using MongoDB $nearSphere operator.
     * The point coordinates should be in (lng, lat) order for GeoJSON.
     * Distance returned in meters.
     */
    @Query("{ geoLocation: { $nearSphere: { $geometry: { type: 'Point', coordinates: [?0, ?1] }, $maxDistance: ?2 } } }")
    List<Place> findNearby(double lng, double lat, double maxDistanceMeters);

    /**
     * Find a place by external place ID and source.
     * Used to check if a map-selected place already exists to prevent duplicates.
     * 
     * @param externalPlaceId External ID from map API (e.g., Google Places ID)
     * @param source Place source (MAP for external selections, INTERNAL for manual)
     * @return Optional containing the place if found
     */
    Optional<Place> findByExternalPlaceIdAndSource(String externalPlaceId, PlaceSource source);
}
