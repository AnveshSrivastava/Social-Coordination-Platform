package com.app.localgroup.place.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexType;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "places")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Place {

    @Id
    private String id;

    private String name;

    private Category category;

    @GeoSpatialIndexed(type = GeoSpatialIndexType.GEO_2DSPHERE)
    private GeoJsonPoint geoLocation;   // GeoJSON Point (lng, lat)

    private List<String> tags;

    public enum Category {
        CAFE, RESTAURANT, ACTIVITY, CAMPUS
    }
}
