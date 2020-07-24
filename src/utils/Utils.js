var THREE = require("three");
var Constants = require("./constants.js");
var validate = require("./validate.js");

var utils = {

	prettyPrintMatrix: function (uglymatrix) {
		for (var s = 0; s < 4; s++) {
			var quartet = [uglymatrix[s],
			uglymatrix[s + 4],
			uglymatrix[s + 8],
			uglymatrix[s + 12]];
			console.log(quartet.map(function (num) { return num.toFixed(4) }))
		}
	},

	makePerspectiveMatrix: function (fovy, aspect, near, far) {

		var out = new THREE.Matrix4();
		var f = 1.0 / Math.tan(fovy / 2),
			nf = 1 / (near - far);

		var newMatrix = [
			f / aspect, 0, 0, 0,
			0, f, 0, 0,
			0, 0, (far + near) * nf, -1,
			0, 0, (2 * far * near) * nf, 0
		]

		out.elements = newMatrix
		return out;
	},

	//gimme radians
	radify: function (deg) {

		function convert(degrees) {
			degrees = degrees || 0;
			return Math.PI * 2 * degrees / 360
		}

		if (typeof deg === 'object') {

			//if [x,y,z] array of rotations
			if (deg.length > 0) {
				return deg.map(function (degree) {
					return convert(degree)
				})
			}

			// if {x: y: z:} rotation object
			else {
				return [convert(deg.x), convert(deg.y), convert(deg.z)]
			}
		}

		//if just a number
		else return convert(deg)
	},

	//gimme degrees
	degreeify: function (rad) {
		function convert(radians) {
			radians = radians || 0;
			return radians * 360 / (Math.PI * 2)
		}

		if (typeof rad === 'object') {
			return [convert(rad.x), convert(rad.y), convert(rad.z)]
		}

		else return convert(rad)
	},

	projectToWorld: function (coords) {

		// Spherical mercator forward projection, re-scaling to WORLD_SIZE

		var projected = [
			-Constants.MERCATOR_A * Constants.DEG2RAD * coords[0] * Constants.PROJECTION_WORLD_SIZE,
			-Constants.MERCATOR_A * Math.log(Math.tan((Math.PI * 0.25) + (0.5 * Constants.DEG2RAD * coords[1]))) * Constants.PROJECTION_WORLD_SIZE
		];

		//z dimension, defaulting to 0 if not provided

		if (!coords[2]) projected.push(0)
		else {
			var pixelsPerMeter = this.projectedUnitsPerMeter(coords[1]);
			projected.push(coords[2] * pixelsPerMeter);
		}

		var result = new THREE.Vector3(projected[0], projected[1], projected[2]);

		return result;
	},

	projectedUnitsPerMeter: function (latitude) {
		return Math.abs(Constants.WORLD_SIZE / Math.cos(Constants.DEG2RAD * latitude) / Constants.EARTH_CIRCUMFERENCE);
	},

	_scaleVerticesToMeters: function (centerLatLng, vertices) {
		var pixelsPerMeter = this.projectedUnitsPerMeter(centerLatLng[1]);
		var centerProjected = this.projectToWorld(centerLatLng);

		for (var i = 0; i < vertices.length; i++) {
			vertices[i].multiplyScalar(pixelsPerMeter);
		}

		return vertices;
	},

	projectToScreen: function (coords) {
		console.log("WARNING: Projecting to screen coordinates is not yet implemented");
	},

	unprojectFromScreen: function (pixel) {
		console.log("WARNING: unproject is not yet implemented");
	},

	//world units to lnglat
	unprojectFromWorld: function (worldUnits) {

		var unprojected = [
			-worldUnits.x / (Constants.MERCATOR_A * Constants.DEG2RAD * Constants.PROJECTION_WORLD_SIZE),
			2 * (Math.atan(Math.exp(worldUnits.y / (Constants.PROJECTION_WORLD_SIZE * (-Constants.MERCATOR_A)))) - Math.PI / 4) / Constants.DEG2RAD
		];

		var pixelsPerMeter = this.projectedUnitsPerMeter(unprojected[1]);

		//z dimension
		var height = worldUnits.z || 0;
		unprojected.push(height / pixelsPerMeter);

		return unprojected;
	},

	toScreenPosition: function (obj, camera) {
		var vector = new THREE.Vector3();

		var widthHalf = 0.5 * renderer.context.canvas.width;
		var heightHalf = 0.5 * renderer.context.canvas.height;

		obj.updateMatrixWorld();
		vector.setFromMatrixPosition(obj.matrixWorld);
		vector.project(camera);

		vector.x = (vector.x * widthHalf) + widthHalf;
		vector.y = - (vector.y * heightHalf) + heightHalf;

		return {
			x: vector.x,
			y: vector.y
		};

	},

	//get the center point of a feature
	getFeatureCenter: function getFeatureCenter(feature, model, level) {
		let center = [];
		let latitude = 0;
		let longitude = 0;
		let height = 0;
		let coordinates = [];
		//deep clone to avoid modifying the original array
		coordinates.push(...feature.geometry.coordinates[0]);
		if (feature.geometry.type === "Point") {
			center = coordinates[0];
		}
		else {
			//features in mapbox repeat the first coordinates at the end. We remove it.
			if (feature.geometry.type === "MultiPolygon") coordinates = coordinates[0];
			coordinates.splice(-1, 1);
			coordinates.forEach(function (c) {
				latitude += c[0];
				longitude += c[1];
			});
			center = [latitude / coordinates.length, longitude / coordinates.length];
		}
		height = this.getObjectHeightOnFloor(feature, model, level);

		(center.length < 3 ? center.push(height) : center[2] = height);

		return center;
	},

	getObjectHeightOnFloor: function (feature, obj, level = feature.properties.level || 0) {
		let floorHeightMin = (level * (feature.properties.levelHeight || 0));
		//object height is modelSize.z + base_height or min_height configured for this object
		let base = (feature.properties.base_height || feature.properties.min_height || 0);
		//let height = ((obj && obj.model) ? obj.modelSize.z : (feature.properties.height - base));
		let height = ((obj && obj.model) ? 0 : (feature.properties.height - base));
		let objectHeight = height + base;
		let modelHeightFloor = floorHeightMin + objectHeight;
		return modelHeightFloor;
	},

	_flipMaterialSides: function (obj) {

	},

	// to improve precision, normalize a series of vector3's to their collective center, and move the resultant mesh to that center
	normalizeVertices(vertices) {

		var geometry = new THREE.Geometry();

		for (v3 of vertices) {
			geometry.vertices.push(v3)
		}

		geometry.computeBoundingSphere();
		var center = geometry.boundingSphere.center;
		var radius = geometry.boundingSphere.radius;

		var scaled = vertices.map(function (v3) {
			var normalized = v3.sub(center);
			return normalized;
		});

		return { vertices: scaled, position: center }
	},

	//flatten an array of Vector3's into a shallow array of values in x-y-z order, for bufferGeometry
	flattenVectors(vectors) {
		var flattenedArray = [];
		for (vertex of vectors) {
			flattenedArray.push(vertex.x, vertex.y, vertex.z);
		}
		return flattenedArray
	},

	//convert a line/polygon to Vector3's

	lnglatsToWorld: function (coords) {

		var vector3 = coords.map(
			function (pt) {
				var p = utils.projectToWorld(pt);
				var v3 = new THREE.Vector3(p.x, p.y, p.z);
				return v3
			}
		);

		return vector3
	},

	extend: function (original, addition) {
		for (const key in addition) original[key] = addition[key];
	},

	clone: function (original) {
		var clone = {};
		for (const key in original) clone[key] = original[key];
		return clone;
	},

	clamp: function(n, min, max) {
		return Math.min(max, Math.max(min, n));
	},

	// retrieve object parameters from an options object

	types: {

		rotation: function (r, currentRotation) {

			//[jscastro] rotation default 0
			if (!r) { r = 0; };

			// if number provided, rotate only in Z by that amount
			if (typeof r === 'number') r = { z: r };

			var degrees = this.applyDefault([r.x, r.y, r.z], currentRotation);
			var radians = utils.radify(degrees);
			return radians;

		},

		scale: function (s, currentScale) {
			//[jscastro] scale default 1
			if (!s) { s = 1; };
			if (typeof s === 'number') return s = [s, s, s];
			else return this.applyDefault([s.x, s.y, s.z], currentScale);
		},

		applyDefault: function (array, current) {

			var output = array.map(function (item, index) {
				item = item || current[index];
				return item
			})

			return output
		}
	},

	_validate: function (userInputs, defaults) {

		userInputs = userInputs || {};
		var validatedOutput = {};
		utils.extend(validatedOutput, userInputs);

		for (const key of Object.keys(defaults)) {

			if (userInputs[key] === undefined) {
				//make sure required params are present
				if (defaults[key] === null) {
					console.error(key + ' is required')
					return;
				}

				else validatedOutput[key] = defaults[key]

			}

			else validatedOutput[key] = userInputs[key]
		}

		return validatedOutput
	},
	Validator: new validate(),
	exposedMethods: ['projectToWorld', 'projectedUnitsPerMeter', 'extend', 'unprojectFromWorld']
}

module.exports = exports = utils
