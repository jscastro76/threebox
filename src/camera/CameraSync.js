var THREE = require("three");
var utils = require("../utils/Utils.js");
var ThreeboxConstants = require("../utils/constants.js");

function CameraSync(map, camera, world) {
    this.map = map;
    this.camera = camera;
    this.active = true;

    this.camera.matrixAutoUpdate = false;   // We're in charge of the camera now!

    // Postion and configure the world group so we can scale it appropriately when the camera zooms
    this.world = world || new THREE.Group();
    this.world.position.x = this.world.position.y = ThreeboxConstants.WORLD_SIZE / 2
    this.world.matrixAutoUpdate = false;

    // set up basic camera state
    this.state = {
        fov: ThreeboxConstants.FOV,
        translateCenter: new THREE.Matrix4().makeTranslation(ThreeboxConstants.WORLD_SIZE / 2, -ThreeboxConstants.WORLD_SIZE / 2, 0),
        worldSizeRatio: ThreeboxConstants.TILE_SIZE / ThreeboxConstants.WORLD_SIZE
    };

    // Listen for move events from the map and update the Three.js camera
    var _this = this;
    this.map
        .on('move', function () {
            _this.updateCamera()
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
        this.camera.updateProjectionMatrix();
        const halfFov = this.state.fov / 2;
        const offset = { x: t.width / 2, y: t.height / 2 };//t.centerOffset;
        const cameraToCenterDistance = 0.5 / Math.tan(halfFov) * t.height;
        const maxPitch = t._maxPitch * Math.PI / 180;
        const acuteAngle = Math.PI / 2 - maxPitch;

        this.state.cameraToCenterDistance = cameraToCenterDistance;
        this.state.offset = offset;
        this.state.cameraTranslateZ = new THREE.Matrix4().makeTranslation(0, 0, cameraToCenterDistance);
        this.state.maxFurthestDistance = cameraToCenterDistance * 0.95 * (Math.cos(acuteAngle) * Math.sin(halfFov) / Math.sin(Math.max(0.01, Math.min(Math.PI - 0.01, acuteAngle - halfFov))) + 1);

        this.updateCamera();
    },

    updateCamera: function (ev) {
        if (!this.camera) {
            console.log('nocamera')
            return;
        }

        // Furthest distance optimized by @satorbs
        // https://github.com/satorbs/threebox/blob/master/src/Camera/CameraSync.js
        const t = this.map.transform;
        const groundAngle = Math.PI / 2 + t._pitch;
        const fovAboveCenter = this.state.fov * (0.5 + this.state.offset.y / t.height);
        const topHalfSurfaceDistance = Math.sin(fovAboveCenter) * this.state.cameraToCenterDistance / Math.sin(utils.clamp(Math.PI - groundAngle - fovAboveCenter, 0.01, Math.PI - 0.01));

        // Calculate z distance of the farthest fragment that should be rendered.
        const furthestDistance = Math.cos(Math.PI / 2 - t._pitch) * topHalfSurfaceDistance + this.state.cameraToCenterDistance;

        // Add a bit extra to avoid precision problems when a fragment's distance is exactly `furthestDistance`
        const farZ = Math.min(furthestDistance * 1.01, this.state.maxFurthestDistance);

        // someday @ansis set further near plane to fix precision for deckgl,so we should fix it to use mapbox-gl v1.3+ correctly
        // https://github.com/mapbox/mapbox-gl-js/commit/5cf6e5f523611bea61dae155db19a7cb19eb825c#diff-5dddfe9d7b5b4413ee54284bc1f7966d
        const nearZ = (t.height / 50);

        this.camera.projectionMatrix = utils.makePerspectiveMatrix(this.state.fov, t.width / t.height, nearZ, farZ);

        // Unlike the Mapbox GL JS camera, separate camera translation and rotation out into its world matrix
        // If this is applied directly to the projection matrix, it will work OK but break raycasting
        var cameraWorldMatrix = this.calcCameraMatrix(t._pitch, t.angle);
        this.camera.matrixWorld.copy(cameraWorldMatrix);

        var zoomPow = t.scale * this.state.worldSizeRatio;
        // Handle scaling and translation of objects in the map in the world's matrix transform, not the camera
        var scale = new THREE.Matrix4;
        var translateMap = new THREE.Matrix4;
        var rotateMap = new THREE.Matrix4;

        scale.makeScale(zoomPow, zoomPow, zoomPow);

        var x = t.x || t.point.x;
        var y = t.y || t.point.y;
        translateMap.makeTranslation(-x, y, 0);
        rotateMap.makeRotationZ(Math.PI);

        this.world.matrix = new THREE.Matrix4()
            .premultiply(rotateMap)
            .premultiply(this.state.translateCenter)
            .premultiply(scale)
            .premultiply(translateMap)


        // utils.prettyPrintMatrix(this.camera.projectionMatrix.elements);
    },

    calcCameraMatrix(pitch, angle, trz) {
        const t = this.map.transform;
        const _pitch = (pitch === undefined) ? t._pitch : pitch;
        const _angle = (angle === undefined) ? t.angle : angle;
        const _trz = (trz === undefined) ? this.state.cameraTranslateZ : trz;

        return new THREE.Matrix4()
            .premultiply(_trz)
            .premultiply(new THREE.Matrix4().makeRotationX(_pitch))
            .premultiply(new THREE.Matrix4().makeRotationZ(_angle));
    }
}

module.exports = exports = CameraSync;