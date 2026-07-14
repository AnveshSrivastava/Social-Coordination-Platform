const http = require('http');

http.get('http://localhost:8080/places/nearby?lat=28.123&lng=77.123&radius=2000', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log(data);
    });
}).on('error', (err) => {
    console.error(err);
});
