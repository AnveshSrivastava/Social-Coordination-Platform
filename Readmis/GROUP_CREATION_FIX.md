# Group Creation Fix - 400 Bad Request Error

## Issue
When trying to create a group with a place selected from the map, the API was returning a **400 Bad Request** error.

### Root Cause
The frontend was sending place categories like:
- `MALL`
- `CINEMA`
- `BOWLING_ALLEY`
- `BAR`
- `NIGHTCLUB`
- `PLACE_OF_WORSHIP`
- `PARK`
- `TOURIST`
- `AMUSEMENT_PARK`

But the backend `Place.Category` enum only supported:
- `CAFE`
- `RESTAURANT`
- `ACTIVITY`
- `CAMPUS`

When Jackson tried to deserialize the JSON, it couldn't map the unknown category values to the enum, causing a **validation error (400)**.

---

## Solution
Updated [Place.java](backend/src/main/java/com/app/localgroup/place/model/Place.java) to include all categories:

```java
public enum Category {
    CAFE, RESTAURANT, ACTIVITY, CAMPUS, MALL, CINEMA, BOWLING_ALLEY, 
    BAR, NIGHTCLUB, PLACE_OF_WORSHIP, PARK, TOURIST, AMUSEMENT_PARK
}
```

---

## Files Modified
- [backend/src/main/java/com/app/localgroup/place/model/Place.java](backend/src/main/java/com/app/localgroup/place/model/Place.java)

---

## Testing
1. Open the map view
2. Click on any place to create a group
3. Fill in the group details (date, size, visibility)
4. Click "Create Group"
5. ✅ Group should be created successfully without 400 errors

---

## Category Mapping Reference

| Frontend Category | Backend Enum | Source |
|------------------|-------------|--------|
| CAFE | CAFE | OSM Data |
| RESTAURANT | RESTAURANT | OSM Data |
| BAR | BAR | OSM Data |
| NIGHTCLUB | NIGHTCLUB | OSM Data |
| CINEMA | CINEMA | OSM Data |
| BOWLING_ALLEY | BOWLING_ALLEY | OSM Data |
| PLACE_OF_WORSHIP | PLACE_OF_WORSHIP | OSM Data |
| TOURIST | TOURIST | OSM Data (Museum, Attraction) |
| AMUSEMENT_PARK | AMUSEMENT_PARK | OSM Data (Theme Park) |
| MALL | MALL | OSM Data |
| PARK | PARK | OSM Data |
| ACTIVITY | ACTIVITY | Default fallback |
| CAMPUS | CAMPUS | System/Manual |

---

## Why This Happened
The Overpass API (OpenStreetMap) returns many more place types than the backend originally supported. The frontend had to map these OSM categories to what the backend expected, but wasn't accounting for all possibilities. This fix aligns the backend and frontend category systems.
