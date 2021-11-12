const WORLD_SIZE = 1024000; //TILE_SIZE * 2000
const MERCATOR_A = 6378137.0; // 900913 projection property. (Deprecated) Replaced by EARTH_RADIUS
const FOV_ORTHO = 0.1 / 180 * Math.PI; //Mapbox doesn't accept 0 as FOV
const FOV = Math.atan(3 / 4); //from Mapbox https://github.com/mapbox/mapbox-gl-js/blob/main/src/geo/transform.js#L93
const EARTH_RADIUS = 6371008.8; //from Mapbox  https://github.com/mapbox/mapbox-gl-js/blob/0063cbd10a97218fb6a0f64c99bf18609b918f4c/src/geo/lng_lat.js#L11
const EARTH_CIRCUMFERENCE_EQUATOR = 40075017 //from Mapbox https://github.com/mapbox/mapbox-gl-js/blob/0063cbd10a97218fb6a0f64c99bf18609b918f4c/src/geo/lng_lat.js#L117

module.exports = exports = {
    WORLD_SIZE: WORLD_SIZE,
    PROJECTION_WORLD_SIZE: WORLD_SIZE / (EARTH_RADIUS * Math.PI * 2),
    MERCATOR_A: EARTH_RADIUS, 
    DEG2RAD: Math.PI / 180,
    RAD2DEG: 180 / Math.PI,
    EARTH_RADIUS: EARTH_RADIUS,
    EARTH_CIRCUMFERENCE: 2 * Math.PI * EARTH_RADIUS, //40075000, // In meters
    EARTH_CIRCUMFERENCE_EQUATOR: EARTH_CIRCUMFERENCE_EQUATOR, 
    FOV_ORTHO: FOV_ORTHO, // closest to 0
    FOV: FOV, // Math.atan(3/4) radians. If this value is changed, FOV_DEGREES must be calculated
    FOV_DEGREES: FOV * 180 / Math.PI, // Math.atan(3/4) in degrees
    TILE_SIZE: 512
}
