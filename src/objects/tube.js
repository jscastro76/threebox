var utils = require("../utils/Utils.js");
var material = require("../utils/material.js");
var Objects = require('./objects.js');
var Object3D = require('./Object3D.js');
var THREE = require("three");

function tube(obj, world){

	// validate and prep input geometry
	var obj = utils._validate(obj, Objects.prototype._defaults.tube);
    var straightProject = utils.lnglatsToWorld(obj.geometry);
	var normalized = utils.normalizeVertices(straightProject);

	var crossSection = tube.prototype.defineCrossSection(obj);
	var vertices = tube.prototype.buildVertices(crossSection, normalized.vertices, world);
	var geom = tube.prototype.buildFaces(vertices, normalized.vertices, obj);

	var mat = material(obj);

    var mesh = new THREE.Mesh( geom, mat );
    //mesh.position.copy(normalized.position);

	//[jscastro] we convert it in Object3D to add methods, bounding box, model, tooltip...
	return new Object3D({ obj: mesh, units: obj.units, anchor: obj.anchor, adjustment: obj.adjustment });

	//return mesh

}

tube.prototype = {

	buildVertices: function (crossSection, spine, world){

		//create reusable plane for intersection calculations
		var geometry = new THREE.PlaneBufferGeometry(99999999999, 9999999999);
		var m = new THREE.MeshBasicMaterial( {color: 0xffffff, side: THREE.DoubleSide} );
		m.opacity = 0
		var plane = new THREE.Mesh( geometry, m );
		// world.add( plane );

		var geom = new THREE.Geometry();
		var lastElbow = false;


		// BUILD VERTICES: iterate through points in spine and position each vertex in cross section


		// get normalized vectors for each spine segment
		var spineSegments = [spine[0].clone().normalize()];

		for (i in spine) {

			i = parseFloat(i);

			var segment;

			if (spine[i+1]){
				segment = new THREE.Vector3()
					.subVectors( spine[i+1], spine[i])
					.normalize();

			}

			spineSegments.push(segment);
		}

		spineSegments.push(new THREE.Vector3());

		for (i in spine) {

			i = parseFloat(i);
			var lineVertex = spine[i];

			// ROTATE cross section

			var humerus = spineSegments[i]

			var forearm = spineSegments[i+1]

			var midpointToLookAt = humerus.clone()
				.add(forearm)
				.normalize();

			if (i === 0) midpointToLookAt = forearm;

			else if (i === spine.length - 1) midpointToLookAt = humerus;


			// if first point in input line, rotate and translate it to position
			if (!lastElbow) {

				var elbow = crossSection.clone();

				elbow
					.lookAt(midpointToLookAt)

				elbow.vertices.forEach(function(vertex){
					geom.vertices
						.push(vertex.add(lineVertex));
				})

				lastElbow = elbow.vertices;

			}

			else {

				var elbow = [];
				plane.position.copy(lineVertex);
				plane.lookAt(midpointToLookAt.clone().add(lineVertex));
				plane.updateMatrixWorld();

				lastElbow.forEach(function(v3){

					var raycaster = new THREE.Raycaster(v3, humerus);

					var intersection = raycaster
						.intersectObject(plane)[0];

					if (intersection) {
						geom.vertices.push(intersection.point);
						elbow.push(intersection.point);
					}

					else console.error('Tube geometry failed at vertex '+i+'. Consider reducing tube radius, or smoothening out the sharp angle at this vertex')
				})

				lastElbow = elbow
			}

		}

		world.remove(plane);

		return geom
	},

	defineCrossSection: function(obj){
        var crossSection = new THREE.Geometry();
        var count = obj.sides;

        for ( var i = 0; i < count; i ++ ) {

            var l = obj.radius;
            var a = (i+0.5) / count * Math.PI;

            crossSection.vertices.push(
            	new THREE.Vector3 (
            		-Math.sin( 2 * a ),
            		Math.cos( 2 * a ),
            		0
            	)
            	.multiplyScalar(l)
            );
        }

        return crossSection
	},

	//build faces between vertices

	buildFaces: function(geom, spine, obj){

		for (var i in spine) {

			i = parseFloat(i);
			var vertex = spine[i];

			if (i < spine.length - 1) {

				for (var p = 0; p < obj.sides; p++) {

					var b1 = i * obj.sides + p;
					var b2 = i * obj.sides + (p+1) % obj.sides
					var t1 = b1 + obj.sides
					var t2 = b2 + obj.sides;

					var triangle1 = new THREE.Face3(t1, b1, b2);
					var triangle2 = new THREE.Face3(t1, b2, t2);
					geom.faces.push(triangle1, triangle2)
				}
			}
		}

		//add endcaps
		var v = geom.vertices.length;

		for (var c = 0; c+2<obj.sides; c++) {
			var tri1 = new THREE.Face3(0, c+2, c+1);
			var tri2 = new THREE.Face3(v-1, v-1-(c+2), v-1-(c+1))
			geom.faces.push(tri1, tri2)
		}

		//compute normals to get shading to work properly
		geom.computeFaceNormals();

		var bufferGeom = new THREE.BufferGeometry().fromGeometry(geom);
		return geom
	}
}

module.exports = exports = tube;
