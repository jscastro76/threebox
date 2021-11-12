/**
 * @author peterqliu / https://github.com/peterqliu
 * @author jscastro / https://github.com/jscastro76
*/
const utils = require("../utils/utils.js");
const material = require("../utils/material.js");
const THREE = require('three');
const Objects = require('./objects.js');
const Object3D = require('./Object3D.js');

function Sphere(opt) {

	opt = utils._validate(opt, Objects.prototype._defaults.sphere);
	let geometry = new THREE.SphereBufferGeometry(opt.radius, opt.sides, opt.sides);
	let mat = material(opt)
	let output = new THREE.Mesh(geometry, mat);
	//[jscastro] we convert it in Object3D to add methods, bounding box, model, tooltip...
	return new Object3D({ obj: output, units: opt.units, anchor: opt.anchor, adjustment: opt.adjustment, bbox: opt.bbox, tooltip: opt.tooltip, raycasted: opt.raycasted });

}


module.exports = exports = Sphere;
