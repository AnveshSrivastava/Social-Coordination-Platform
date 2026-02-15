# Quick Reference: Dynamic Place Creation Feature

## For Backend Developers

### Using the New Feature in Code

```java
// In GroupService or any service needing place management
@Autowired
private PlaceService placeService;

// Create or reuse a place from map selection
MapPlaceDto mapPlace = MapPlaceDto.builder()
    .name("Starbucks")
    .category(Place.Category.CAFE)
    .latitude(28.6139)
    .longitude(77.2090)
    .externalPlaceId("google-places-123")
    .source(Place.PlaceSource.MAP)
    .build();

String placeId = placeService.findOrCreateMapPlace(mapPlace);
// Result: Either creates new place or returns existing one (no duplicates)
```

### Repository Query

```java
// Find a map-sourced place by external ID
Optional<Place> place = placeRepository
    .findByExternalPlaceIdAndSource("google-123", Place.PlaceSource.MAP);
```

### Converting Place to DTO

```java
// Always use this for API responses
PlaceDto dto = placeService.toDto(place);
```

---

## For API Documentation

### Endpoint: Create Group (Enhanced)

**Request Body:**

**Option 1: Legacy Flow (Backward Compatible)**
```json
{
  "placeId": "507f1f77bcf86cd799439011",
  "dateTime": "2026-02-15T14:30:00Z",
  "maxSize": 4,
  "visibility": "PUBLIC",
  "inviteCode": null
}
```

**Option 2: New Map-Based Flow**
```json
{
  "mapPlace": {
    "name": "Starbucks Coffee Shop",
    "category": "CAFE",
    "latitude": 28.6139,
    "longitude": 77.2090,
    "externalPlaceId": "ChIJIQBpAG2dDjkRSKMpjHyJ4a8",
    "source": "MAP"
  },
  "dateTime": "2026-02-15T14:30:00Z",
  "maxSize": 4,
  "visibility": "PUBLIC",
  "inviteCode": null
}
```

**Response:**
```json
{
  "success": true,
  "message": "Group created",
  "data": {
    "id": "group123",
    "placeId": "place456",
    "creatorId": "user789",
    "dateTime": "2026-02-15T14:30:00Z",
    "maxSize": 4,
    "visibility": "PUBLIC",
    "status": "JOINABLE",
    "createdAt": "2026-02-15T10:00:00Z",
    "memberCount": 1
  }
}
```

---

## For Frontend Integration

### Step 1: Get Map Place Data
```javascript
// Frontend gets place data from map API (Google Places, Mapbox, etc.)
const mapPlace = {
  name: "Starbucks",
  category: "CAFE",
  latitude: 28.6139,
  longitude: 77.2090,
  externalPlaceId: "ChIJIQBpAG2dDjkRSKMpjHyJ4a8",
  source: "MAP"
};
```

### Step 2: Create Group with Map Place
```javascript
const response = await fetch('/groups', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    mapPlace: mapPlace,
    dateTime: new Date(Date.now() + 3600000).toISOString(),
    maxSize: 4,
    visibility: 'PUBLIC'
  })
});

const group = await response.json();
console.log('Group created:', group.data.id);
console.log('Place ID:', group.data.placeId);
```

### Step 3: No Additional Steps Needed
✅ Backend handles place creation/reuse automatically
✅ Same place shared across multiple groups

---

## Data Model Reference

### Place Entity
```
Place {
  // Original fields
  _id: String
  name: String
  category: enum[CAFE, RESTAURANT, ACTIVITY, CAMPUS]
  geoLocation: GeoJsonPoint(lng, lat)
  tags: String[]
  
  // NEW FIELDS (optional, for MAP sources)
  externalPlaceId: String          // External map API ID
  latitude: Double                 // Latitude coordinate
  longitude: Double                // Longitude coordinate
  source: enum[INTERNAL, MAP]      // Defaults: INTERNAL
}
```

### MapPlaceDto
```
MapPlaceDto {
  name: String                     // REQUIRED
  category: enum[...]              // REQUIRED
  latitude: Double                 // REQUIRED for MAP
  longitude: Double                // REQUIRED for MAP
  externalPlaceId: String          // REQUIRED for MAP
  source: enum[INTERNAL, MAP]      // Defaults: MAP
}
```

### CreateGroupDto
```
CreateGroupDto {
  // Legacy flow (backward compatible)
  placeId: String                  // OPTIONAL (if mapPlace not provided)
  
  // New flow (map-based)
  mapPlace: MapPlaceDto             // OPTIONAL (if placeId not provided)
  
  // Common fields
  dateTime: Instant                 // REQUIRED
  maxSize: int[2-6]                 // REQUIRED
  visibility: enum[PUBLIC, PRIVATE] // REQUIRED
  inviteCode: String                // REQUIRED if visibility=PRIVATE
}
```

---

## Logging Output Reference

### When Creating New Place
```
[INFO] Created new map place: externalId=ChIJIQBpAG2dDjkRSKMpjHyJ4a8 placeId=507f1f77bcf86cd799439011
[INFO] Group created: group123 by user789 with place: 507f1f77bcf86cd799439011
```

### When Reusing Existing Place
```
[INFO] Reused map place: externalId=ChIJIQBpAG2dDjkRSKMpjHyJ4a8 placeId=507f1f77bcf86cd799439011
[INFO] Group created: group456 by user999 with place: 507f1f77bcf86cd799439011
```

---

## Common Scenarios

### Scenario 1: Two Groups at Same Location
```
User A creates group at "Starbucks" (externalId: gmap-123)
  ✓ Place created: place-001
  
User B creates group at same "Starbucks" (externalId: gmap-123)
  ✓ Place REUSED: place-001 (no duplicate!)
```

### Scenario 2: Existing Manual Place Still Works
```
Manual place exists: place-manual with source=INTERNAL

User C creates group with placeId=place-manual
  ✓ Group created with manual place (backward compatible)
```

### Scenario 3: Mix Both Flows
```
Some groups use placeId (manual places) ✓
Some groups use mapPlace (map-based) ✓
Both types can coexist in same database ✓
```

---

## Error Handling

### Invalid Request - Missing Both Fields
```json
{
  "placeId": null,
  "mapPlace": null
}
```
**Response:** `400 Bad Request`
**Message:** "Either placeId or mapPlace must be provided"

### Invalid MapPlaceDto - Missing Required Fields
```json
{
  "mapPlace": {
    "name": "Cafe",
    "category": "CAFE",
    "latitude": 28.6139
    // Missing: longitude, externalPlaceId
  }
}
```
**Response:** `400 Bad Request` (validation error)

---

## Files Changed Summary

| File | Purpose | Breaking Change? |
|------|---------|------------------|
| Place.java | Model enhancement | ❌ No |
| MapPlaceDto.java | NEW - Map place DTO | ✅ New |
| CreateGroupDto.java | Enhanced with mapPlace | ❌ No |
| PlaceDto.java | Enhanced with new fields | ❌ No |
| PlaceService.java | Place management logic | ❌ No |
| PlaceRepository.java | New query method | ❌ No |
| GroupService.java | Enhanced createGroup() | ❌ No |
| PlaceController.java | Refactored (no behavior change) | ❌ No |
| DynamicPlaceCreationTests.java | NEW - Tests | ✅ New |

**Bottom Line:** 100% backward compatible, zero migration needed

---

## Testing the Feature

### Run All Tests
```bash
mvn test -Dtest=DynamicPlaceCreationTests
```

### Manual Test: Create Group with Map Place
```bash
curl -X POST http://localhost:8080/groups \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mapPlace": {
      "name": "Test Cafe",
      "category": "CAFE",
      "latitude": 28.6139,
      "longitude": 77.2090,
      "externalPlaceId": "test-123",
      "source": "MAP"
    },
    "dateTime": "2026-02-15T14:30:00Z",
    "maxSize": 4,
    "visibility": "PUBLIC"
  }'
```

### Manual Test: Legacy Flow Still Works
```bash
curl -X POST http://localhost:8080/groups \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "placeId": "507f1f77bcf86cd799439011",
    "dateTime": "2026-02-15T14:30:00Z",
    "maxSize": 4,
    "visibility": "PUBLIC"
  }'
```

---

## Troubleshooting

### Issue: Place not reusing across groups
**Check:** Both groups using same `externalPlaceId` AND `source=MAP`?
```sql
db.places.findOne({
  externalPlaceId: "your-external-id",
  source: "MAP"
})
```

### Issue: Manual places showing new fields
**Expected:** New fields are null for INTERNAL places
```json
{
  "source": "INTERNAL",
  "externalPlaceId": null,
  "latitude": null,
  "longitude": null
}
```

### Issue: Group creation fails with mapPlace
**Check Validation:**
- ✅ name: non-blank
- ✅ category: valid enum value
- ✅ latitude: number between -90 and 90
- ✅ longitude: number between -180 and 180
- ✅ externalPlaceId: non-blank
- ✅ source: defaults to MAP (optional)

---

## Support & Questions

For issues or questions about this feature:
1. Check the test cases in `DynamicPlaceCreationTests.java`
2. Review logs for "Created new map place" or "Reused map place" messages
3. Verify database state with MongoDB queries
4. Check IMPLEMENTATION_SUMMARY.md for detailed architecture

---

**Last Updated:** 2026-02-15
**Status:** Production Ready ✅
