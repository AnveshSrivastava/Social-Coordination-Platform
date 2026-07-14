package com.app.localgroup.config;

import com.app.localgroup.place.model.Place;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexType;
import org.springframework.data.mongodb.core.index.GeospatialIndex;
import org.springframework.data.mongodb.core.index.IndexOperations;

@Configuration
@RequiredArgsConstructor
public class MongoConfig {

    private final MongoTemplate mongoTemplate;

    @PostConstruct
    public void initIndices() {
        // Since auto-index-creation is disabled to prevent deployment crashes,
        // we must manually create the 2dsphere index required for $nearSphere queries.
        // Without this index, PlaceService.findNearby fails, causing the frontend to 
        // silently fall back to Overpass API and resulting in the map marker regression.
        IndexOperations indexOps = mongoTemplate.indexOps(Place.class);
        indexOps.ensureIndex(new GeospatialIndex("geoLocation").typed(GeoSpatialIndexType.GEO_2DSPHERE));
    }
}
