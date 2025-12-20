package com.app.localgroup.place.repository;

import com.app.localgroup.place.model.Place;
import com.app.localgroup.place.model.Place.Category;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlaceRepository extends MongoRepository<Place, String> {
    List<Place> findByCategory(Category category);
}
