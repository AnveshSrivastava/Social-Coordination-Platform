package com.app.localgroup.place.repository;

import com.app.localgroup.place.model.Place;
import com.app.localgroup.place.model.Place.Category;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

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
}
