package com.app.localgroup.place;

import com.app.localgroup.place.model.Place;
import com.app.localgroup.place.repository.PlaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

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

    public List<Place> findNearby(double lat, double lng, double radiusMeters) {
        // Placeholder simple distance filter (Haversine would be better). We store geoLocation as [lat,lng]
        return placeRepository.findAll().stream().filter(p -> {
            if (p.getGeoLocation() == null || p.getGeoLocation().length < 2) return false;
            double plat = p.getGeoLocation()[0];
            double plng = p.getGeoLocation()[1];
            double dx = Math.toRadians(plat - lat);
            double dy = Math.toRadians(plng - lng);
            double a = Math.sin(dx/2)*Math.sin(dx/2) + Math.cos(Math.toRadians(lat))*Math.cos(Math.toRadians(plat))*Math.sin(dy/2)*Math.sin(dy/2);
            double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            double distance = 6371000 * c; // meters
            return distance <= radiusMeters;
        }).collect(Collectors.toList());
    }

    public long activeGroupCount(String placeId) {
        // Placeholder: real implementation would query GroupRepository
        return 0L;
    }
}
