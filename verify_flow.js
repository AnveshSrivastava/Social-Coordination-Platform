const http = require('http');

function request(method, path, body, token) {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost',
            port: 8080,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
        });
        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function run() {
    try {
        console.log("=== Flow Verification ===");

        // 1. Get token
        const verifyRes = await request('POST', '/auth/verify-otp', { email: "mock@sca.com", phone: "9999999999", otp: "000000" });
        const token1 = verifyRes.body.data;
        if (!token1) throw new Error("No token returned");
        console.log("1. User authenticated");

        // 2. Create group on new map place
        const lat = 28.5 + Math.random() * 0.01;
        const lng = 77.5 + Math.random() * 0.01;
        const externalPlaceId = "osm-test-verify-" + Date.now();

        const groupBody = {
            name: "Test Group Verification",
            description: "A test group",
            visibility: "PUBLIC",
            maxSize: 5,
            dateTime: new Date(Date.now() + 86400000).toISOString(),
            durationMinutes: 60,
            mapPlace: {
                name: "Test Map Place",
                category: "CAFE",
                latitude: lat,
                longitude: lng,
                externalPlaceId: externalPlaceId,
                source: "MAP"
            }
        };

        const createRes = await request('POST', '/groups', groupBody, token1);
        console.log("2. Group created:", createRes.body.success ? "Success" : createRes.body);

        // 3. Refresh page (fetch nearby)
        const nearbyRes = await request('GET', `/places/nearby?lat=${lat}&lng=${lng}&radius=2000`, null, token1);
        const place = nearbyRes.body.data.find(p => p.externalPlaceId === externalPlaceId);
        console.log("3. getNearby returns place:", !!place);
        if (!place) {
             console.log("Nearby returned:", nearbyRes.body.data.map(p => p.externalPlaceId));
             throw new Error("Place not found in nearby results");
        }
        const mongoId = place.id;
        console.log("   Mongo ID assigned:", mongoId);

        // 4. Click place (fetch groups)
        const groupsRes1 = await request('GET', `/groups/place/${mongoId}`, null, token1);
        const groupFound1 = groupsRes1.body.data.some(g => true);
        console.log("4. Creator sees group in panel:", groupFound1);

        // 5. Guest sees group
        const groupsResGuest = await request('GET', `/groups/place/${mongoId}`, null, null);
        const groupFoundGuest = groupsResGuest.body.data.some(g => true);
        console.log("5. Guest sees group in panel:", groupFoundGuest);

        // 6. Verify duplicate places
        const groupBody2 = { ...groupBody, name: "Test Group Verification 2" };
        await request('POST', '/groups', groupBody2, token1);
        const nearbyResAfter = await request('GET', `/places/nearby?lat=${lat}&lng=${lng}&radius=2000`, null, token1);
        const duplicates = nearbyResAfter.body.data.filter(p => p.externalPlaceId === externalPlaceId);
        console.log("6. Duplicate places created:", duplicates.length > 1 ? `YES (${duplicates.length})` : "NO");

    } catch (e) {
        console.error("Error:", e);
    }
}
run();
