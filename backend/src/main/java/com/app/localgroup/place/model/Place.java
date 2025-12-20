package com.app.localgroup.place.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexed;
import org.springframework.data.mongodb.core.index.Indexed;
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

    @Indexed
    private Category category;

    @GeoSpatialIndexed
    private double[] geoLocation; // [lat, lng]

    private List<String> tags;

    public enum Category {
        CAFE, RESTAURANT, ACTIVITY, CAMPUS
    }
}
