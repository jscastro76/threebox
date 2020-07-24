var THREE = require("three");
var utils = require("../utils/Utils.js");
var material = require("../utils/material.js");
var Objects = require('./objects.js');
var Object3D = require('./Object3D.js');

function Sphere(options) {

	options = utils._validate(options, Objects.prototype._defaults.sphere);
	var geometry = new THREE.SphereBufferGeometry(options.radius, options.sides, options.sides);
	var mat = material(options)
	var output = new THREE.Mesh(geometry, mat);

	//[jscastro] we convert it in Object3D to add methods, bounding box, model, tooltip...
	return new Object3D({ obj: output, units: options.units, anchor: options.anchor, adjustment: options.adjustment });

}


module.exports = exports = Sphere;
