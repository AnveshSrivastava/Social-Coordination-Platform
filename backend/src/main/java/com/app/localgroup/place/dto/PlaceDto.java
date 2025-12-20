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
    private double[] geoLocation;
    private List<String> tags;
    private long activeGroupCount;
}
