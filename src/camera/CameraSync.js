/**
 * @author peterqliu / https://github.com/peterqliu
 * @author jscastro / https://github.com/jscastro76
 */
const THREE = require("three");
const utils = require("../utils/utils.js");
const ThreeboxConstants = require("../utils/constants.js");

function CameraSync(map, camera, world) {
    //    console.log("CameraSync constructor");
    this.map = map;
    this.camera = camera;
    this.active = true;

    this.camera.matrixAutoUpdate = false; // We're in charge of the camera now!

    // Postion and configure the world group so we can scale it appropriately when the camera zooms
    this.world = world || new THREE.Group();
    this.world.position.x = this.world.position.y = ThreeboxConstants.WORLD_SIZE / 2
    this.world.matrixAutoUpdate = false;

    // set up basic camera state
    this.state = {
        translateCenter: new THREE.Matrix4().makeTranslation(ThreeboxConstants.WORLD_SIZE / 2, -ThreeboxConstants.WORLD_SIZE / 2, 0),
        worldSizeRatio: ThreeboxConstants.TILE_SIZE / ThreeboxConstants.WORLD_SIZE,
        worldSize: ThreeboxConstants.TILE_SIZE * this.map.transform.scale
    };

    // Listen for move events from the map and update the Three.js camera
    let _this = this; // keep the function on _this
    this.map
        .on('move', function () {
            _this.updateCamera();
        })
        .on('resize', function () {
            _this.setupCamera();
        })

    this.setupCamera();
}

CameraSync.prototype = {
    setupCamera: function () {
        const t = this.map.transform;
        this.camera.aspect = t.width / t.height; //bug fixed, if aspect is not reset raycast will fail on map resize
        this.halfFov = t._fov / 2;
        this.cameraToCenterDistance = 0.5 / Math.tan(this.halfFov) * t.height;
        const maxPitch = t._maxPitch * Math.PI / 180;
        this.acuteAngle = Math.PI / 2 - maxPitch;
        this.updateCamera();
    },

    updateCamera: function (ev) {
        if (!this.camera) {
            console.log('nocamera')
            return;
        }

        const t = this.map.transform;
        this.camera.aspect = t.width / t.height; //bug fixed, if aspect is not reset raycast will fail on map resize
        const offset = t.centerOffset || new THREE.Vector3(); //{ x: t.width / 2, y: t.height / 2 };
        let farZ = 0;
        let furthestDistance = 0;
        this.halfFov = t._fov / 2;
        const groundAngle = Math.PI / 2 + t._pitch;
        const pitchAngle = Math.cos((Math.PI / 2) - t._pitch); //pitch seems to influence heavily the depth calculation and cannot be more than 60 = PI/3 < v1 and 85 > v2
        this.cameraToCenterDistance = 0.5 / Math.tan(this.halfFov) * t.height;
        let pixelsPerMeter = 1;
        const worldSize = this.worldSize();

        if (this.map.tb.mapboxVersion >= 2.0) {
            // mapbox version >= 2.0
            pixelsPerMeter = this.mercatorZfromAltitude(1, t.center.lat) * worldSize;
            const fovAboveCenter = t._fov * (0.5 + t.centerOffset.y / t.height);

            // Adjust distance to MSL by the minimum possible elevation visible on screen,
            // this way the far plane is pushed further in the case of negative elevation.
            const minElevationInPixels = t.elevation ? t.elevation.getMinElevationBelowMSL() * pixelsPerMeter : 0;
            const cameraToSeaLevelDistance = ((t._camera.position[2] * worldSize) - minElevationInPixels) / Math.cos(t._pitch);
            const topHalfSurfaceDistance = Math.sin(fovAboveCenter) * cameraToSeaLevelDistance / Math.sin(utils.clamp(Math.PI - groundAngle - fovAboveCenter, 0.01, Math.PI - 0.01));

            // Calculate z distance of the farthest fragment that should be rendered.
            furthestDistance = pitchAngle * topHalfSurfaceDistance + cameraToSeaLevelDistance;

            // Add a bit extra to avoid precision problems when a fragment's distance is exactly `furthestDistance`
            const horizonDistance = cameraToSeaLevelDistance * (1 / t._horizonShift);
            farZ = Math.min(furthestDistance * 1.01, horizonDistance);
        } else {
            // mapbox version < 2.0 or azure maps
            // Furthest distance optimized by @jscastro76
            const topHalfSurfaceDistance = Math.sin(this.halfFov) * this.cameraToCenterDistance / Math.sin(Math.PI - groundAngle - this.halfFov);

            // Calculate z distance of the farthest fragment that should be rendered. 
            furthestDistance = pitchAngle * topHalfSurfaceDistance + this.cameraToCenterDistance;

            // Add a bit extra to avoid precision problems when a fragment's distance is exactly `furthestDistance`
            farZ = furthestDistance * 1.01;
        }
        this.cameraTranslateZ = new THREE.Matrix4().makeTranslation(0, 0, this.cameraToCenterDistance);

        // someday @ansis set further near plane to fix precision for deckgl,so we should fix it to use mapbox-gl v1.3+ correctly
        // https://github.com/mapbox/mapbox-gl-js/commit/5cf6e5f523611bea61dae155db19a7cb19eb825c#diff-5dddfe9d7b5b4413ee54284bc1f7966d
        const nz = (t.height / 50); //min near z as coded by @ansis
        const nearZ = Math.max(nz * pitchAngle, nz); //on changes in the pitch nz could be too low

        const h = t.height;
        const w = t.width;
        if (this.camera instanceof THREE.OrthographicCamera) {
            this.camera.projectionMatrix = utils.makeOrthographicMatrix(w / - 2, w / 2, h / 2, h / - 2, nearZ, farZ);
        } else {
            this.camera.projectionMatrix = utils.makePerspectiveMatrix(t._fov, w / h, nearZ, farZ);
        }
        this.camera.projectionMatrix.elements[8] = -offset.x * 2 / t.width;
        this.camera.projectionMatrix.elements[9] = offset.y * 2 / t.height;

        // Unlike the Mapbox GL JS camera, separate camera translation and rotation out into its world matrix
        // If this is applied directly to the projection matrix, it will work OK but break raycasting
        let cameraWorldMatrix = this.calcCameraMatrix(t._pitch, t.angle);
        // When terrain layers are included, height of 3D layers must be modified from t_camera.z * worldSize
        if (t.elevation) cameraWorldMatrix.elements[14] = t._camera.position[2] * worldSize;
        //this.camera.matrixWorld.elements is equivalent to t._camera._transform
        this.camera.matrixWorld.copy(cameraWorldMatrix);
        
        let zoomPow = t.scale * this.state.worldSizeRatio;
        // Handle scaling and translation of objects in the map in the world's matrix transform, not the camera
        let scale = new THREE.Matrix4;
        let translateMap = new THREE.Matrix4;
        let rotateMap = new THREE.Matrix4;

        scale.makeScale(zoomPow, zoomPow, zoomPow);

        let x = t.x || t.point.x;
        let y = t.y || t.point.y;
        translateMap.makeTranslation(-x, y, 0);
        rotateMap.makeRotationZ(Math.PI);

        this.world.matrix = new THREE.Matrix4()
            .premultiply(rotateMap)
            .premultiply(this.state.translateCenter)
            .premultiply(scale)
            .premultiply(translateMap)

        // utils.prettyPrintMatrix(this.camera.projectionMatrix.elements);
        this.map.fire('CameraSynced', { detail: { nearZ: nearZ, farZ: farZ, pitch: t._pitch, angle: t.angle, furthestDistance: furthestDistance, cameraToCenterDistance: this.cameraToCenterDistance, t: this.map.transform, tbProjMatrix: this.camera.projectionMatrix.elements, tbWorldMatrix: this.world.matrix.elements, cameraSyn: CameraSync } });

    },

    worldSize() {
        let t = this.map.transform;
        return t.tileSize * t.scale;
    },

    worldSizeFromZoom() {
        let t = this.map.transform;
        return Math.pow(2.0, t.zoom) * t.tileSize;
    },

    mercatorZfromAltitude(altitude, lat) {
        return altitude / this.circumferenceAtLatitude(lat);
    },

    mercatorZfromZoom() {
        return this.cameraToCenterDistance / this.worldSizeFromZoom();
    },

    circumferenceAtLatitude(latitude) {
        return ThreeboxConstants.EARTH_CIRCUMFERENCE * Math.cos(latitude * Math.PI / 180);
    },

    calcCameraMatrix(pitch, angle, trz) {
        const t = this.map.transform;
        const _pitch = (pitch === undefined) ? t._pitch : pitch;
        const _angle = (angle === undefined) ? t.angle : angle;
        const _trz = (trz === undefined) ? this.cameraTranslateZ : trz;

        return new THREE.Matrix4()
            .premultiply(_trz)
            .premultiply(new THREE.Matrix4().makeRotationX(_pitch))
            .premultiply(new THREE.Matrix4().makeRotationZ(_angle));
    },

    updateCameraState() {
        let t = this.map.transform;
        if (!t.height) return;

        // Set camera orientation and move it to a proper distance from the map
        //t._camera.setPitchBearing(t._pitch, t.angle);

        const dir = t._camera.forward();
        const distance = t.cameraToCenterDistance;
        const center = t.point;

        // Use camera zoom (if terrain is enabled) to maintain constant altitude to sea level
        const zoom = t._cameraZoom ? t._cameraZoom : t._zoom;
        const altitude = this.mercatorZfromZoom(t);
        const height = altitude - this.mercatorZfromAltitude(t._centerAltitude, t.center.lat);

        // simplified version of: this._worldSizeFromZoom(this._zoomFromMercatorZ(height))
        const updatedWorldSize = t.cameraToCenterDistance / height;
        return [
            center.x / this.worldSize() - (dir[0] * distance) / updatedWorldSize,
            center.y / this.worldSize() - (dir[1] * distance) / updatedWorldSize,
            this.mercatorZfromAltitude(t._centerAltitude, t._center.lat) + (-dir[2] * distance) / updatedWorldSize
        ];

    },

    getWorldToCamera(worldSize, pixelsPerMeter) {
        // transformation chain from world space to camera space:
        // 1. Height value (z) of renderables is in meters. Scale z coordinate by pixelsPerMeter
        // 2. Transform from pixel coordinates to camera space with cameraMatrix^-1
        // 3. flip Y if required

        // worldToCamera: flip * cam^-1 * zScale
        // cameraToWorld: (flip * cam^-1 * zScale)^-1 => (zScale^-1 * cam * flip^-1)
        let t = this.map.transform;
        const matrix = new THREE.Matrix4();
        const matrixT = new THREE.Matrix4();

        // Compute inverse of camera matrix and post-multiply negated translation
        const o = t._camera._orientation;
        const p = t._camera.position;
        const invPosition = new THREE.Vector3(p[0], p[1], p[2]);

        const quat = new THREE.Quaternion();
        quat.set(o[0], o[1], o[2], o[3]);
        const invOrientation = quat.conjugate();
        invPosition.multiplyScalar(-worldSize);

        matrixT.makeTranslation(invPosition.x, invPosition.y, invPosition.z);
        matrix
            .makeRotationFromQuaternion(invOrientation)
            .premultiply(matrixT);
        //this would make the matrix exact to getWorldToCamera but breaks
        //this.translate(matrix.elements, matrix.elements, invPosition);

        // Pre-multiply y (2nd row)
        matrix.elements[1] *= -1.0;
        matrix.elements[5] *= -1.0;
        matrix.elements[9] *= -1.0;
        matrix.elements[13] *= -1.0;

        // Post-multiply z (3rd column)
        matrix.elements[8] *= pixelsPerMeter;
        matrix.elements[9] *= pixelsPerMeter;
        matrix.elements[10] *= pixelsPerMeter;
        matrix.elements[11] *= pixelsPerMeter;
        //console.log(matrix.elements);
        return matrix;
    },

    translate(out, a, v) {
        let x = v[0] || v.x,
            y = v[1] || v.y,
            z = v[2] || v.z;
        let a00, a01, a02, a03;
        let a10, a11, a12, a13;
        let a20, a21, a22, a23;
        if (a === out) {
            out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
            out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
            out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
            out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
        } else {
            a00 = a[0];
            a01 = a[1];
            a02 = a[2];
            a03 = a[3];
            a10 = a[4];
            a11 = a[5];
            a12 = a[6];
            a13 = a[7];
            a20 = a[8];
            a21 = a[9];
            a22 = a[10];
            a23 = a[11];
            out[0] = a00;
            out[1] = a01;
            out[2] = a02;
            out[3] = a03;
            out[4] = a10;
            out[5] = a11;
            out[6] = a12;
            out[7] = a13;
            out[8] = a20;
            out[9] = a21;
            out[10] = a22;
            out[11] = a23;
            out[12] = a00 * x + a10 * y + a20 * z + a[12];
            out[13] = a01 * x + a11 * y + a21 * z + a[13];
            out[14] = a02 * x + a12 * y + a22 * z + a[14];
            out[15] = a03 * x + a13 * y + a23 * z + a[15];
        }
        return out;
    }
}

module.exports = exports = CameraSync;
