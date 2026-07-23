package com.app.localgroup.config;

import com.app.localgroup.place.model.Place;
import com.app.localgroup.user.model.User;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexType;
import org.springframework.data.mongodb.core.index.GeospatialIndex;
import org.springframework.data.mongodb.core.index.Index;
import org.springframework.data.mongodb.core.index.IndexOperations;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class MongoConfig {

    private final MongoTemplate mongoTemplate;

    @PostConstruct
    public void initIndices() {
        // 1. Geospatial 2dsphere index for places
        try {
            IndexOperations placeIndexOps = mongoTemplate.indexOps(Place.class);
            placeIndexOps.ensureIndex(new GeospatialIndex("geoLocation").typed(GeoSpatialIndexType.GEO_2DSPHERE));
            log.info("Geospatial index (2dsphere) verified on Place.geoLocation");
        } catch (Exception e) {
            log.warn("Notice ensuring 2dsphere index on Place.geoLocation: {}", e.getMessage());
            try {
                mongoTemplate.indexOps(Place.class).dropIndex("geoLocation_2dsphere");
                mongoTemplate.indexOps(Place.class).ensureIndex(new GeospatialIndex("geoLocation").typed(GeoSpatialIndexType.GEO_2DSPHERE));
                log.info("Re-created 2dsphere index on Place.geoLocation after resolving conflict.");
            } catch (Exception ex) {
                log.error("Could not recreate 2dsphere index on Place.geoLocation: {}", ex.getMessage());
            }
        }

        // 2. Sparse unique index for user usernames
        // Allows multiple null usernames for existing/uncompleted users while enforcing unique non-null usernames
        try {
            IndexOperations userIndexOps = mongoTemplate.indexOps(User.class);
            userIndexOps.ensureIndex(new Index().on("username", org.springframework.data.domain.Sort.Direction.ASC).unique().sparse());
            log.info("Sparse unique index verified on User.username");
        } catch (Exception e) {
            log.warn("IndexOptionsConflict or error on User.username index: {}. Resolving conflict...", e.getMessage());
            try {
                mongoTemplate.indexOps(User.class).dropIndex("username_1");
                mongoTemplate.indexOps(User.class).ensureIndex(new Index().on("username", org.springframework.data.domain.Sort.Direction.ASC).unique().sparse());
                log.info("Successfully dropped old index and created sparse unique index on User.username");
            } catch (Exception ex) {
                log.error("Failed to resolve index conflict on User.username: {}", ex.getMessage());
            }
        }
    }
}
