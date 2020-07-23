var utils = require("../utils/utils.js");
var material = require("../utils/material.js");
const THREE = require('three');

const AnimationManager = require("../animation/AnimationManager.js");
const CSS2D = require("./CSS2DRenderer.js");


function Objects(){

}

Objects.prototype = {

	// standard 1px line with gl
	line: function (obj) {

		obj = utils._validate(obj, this._defaults.line);

		//project to world and normalize
		var straightProject = utils.lnglatsToWorld(obj.geometry);
		var normalized = utils.normalizeVertices(straightProject);

		//flatten array for buffergeometry
		var flattenedArray = utils.flattenVectors(normalized.vertices);

		var positions = new Float32Array(flattenedArray); // 3 vertices per point
		var geometry = new THREE.BufferGeometry();
		geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

		// material
		var material = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 21 });
		var line = new THREE.Line(geometry, material);

		line.options = options || {};
		line.position.copy(normalized.position)

		return line
	},

	extrusion: function (options) {

	},

	_addMethods: function (obj, isStatic) {

		var root = this;

		if (isStatic) {

		}

		else {

			if (!obj.coordinates) obj.coordinates = [0, 0, 0];

			// Bestow this mesh with animation superpowers and keeps track of its movements in the global animation queue
			root.animationManager.enroll(obj);

			obj.setCoords = function (lnglat) {

				/** Place the given object on the map, centered around the provided longitude and latitude
					The object's internal coordinates are assumed to be in meter-offset format, meaning
					1 unit represents 1 meter distance away from the provided coordinate.
				*/

				// If object already added, scale the model so that its units are interpreted as meters at the given latitude
				//[jscastro] this method could be needed more times
				if (obj.userData.units === 'meters') {
					var s = utils.projectedUnitsPerMeter(lnglat[1]);
					if (!s) { s = 1; };
					s = Number(s.toFixed(7)); //this precision level is to avoid deviations on the size of the same object
					if (typeof s === 'number') obj.scale.set(s, s, s);
					else obj.scale.set(s.x, s.y, s.z); 	//initialize the object size and it will rescale the rest
				}

				// CSS2DObjects could bring an specific vertical positioning to correct in units
				if (obj.userData.topMargin && obj.userData.feature) {
					lnglat[2] += (obj.userData.feature.properties.height - (obj.userData.feature.properties.base_height || obj.userData.feature.properties.min_height || 0)) * obj.userData.topMargin;
				}

				obj.coordinates = lnglat;
				obj.set({ position: lnglat });
				//Each time the object is positioned, set modelHeight property and project the floor
				obj.modelHeight = obj.coordinates[2];
				obj.setBoundingBoxShadowFloor();
				return obj;

			}

			obj.setTranslate = function (lnglat) {

				obj.set({ translate: lnglat });
				return obj;

			}

			obj.setRotation = function (xyz) {

				if (typeof xyz === 'number') xyz = { z: xyz }

				var r = {
					x: utils.radify(xyz.x) || obj.rotation.x,
					y: utils.radify(xyz.y) || obj.rotation.y,
					z: utils.radify(xyz.z) || obj.rotation.z
				}

				obj._setObject({ rotation: [r.x, r.y, r.z] })
			}

			//[jscastro] added method to adjust 3D models to their issues with center position for rotation
			obj.calculateAdjustedPosition = function (lnglat, xyz, inverse) {

				let location = lnglat.slice();

				//we convert the units to Long/Lat/Height
				let newCoords = utils.unprojectFromWorld(obj.modelSize);

				if (inverse) {
					//each model will have different adjustment attributes, we add them for x, y, z
					location[0] -= (xyz.x != 0 ? (newCoords[0] / xyz.x) : 0);
					location[1] -= (xyz.y != 0 ? (newCoords[1] / xyz.y) : 0);
					location[2] -= (xyz.z != 0 ? (newCoords[2] / xyz.z) : 0);
				} else {
					//each model will have different adjustment attributes, we add them for x, y, z
					location[0] += (xyz.x != 0 ? (newCoords[0] / xyz.x) : 0);
					location[1] += (xyz.y != 0 ? (newCoords[1] / xyz.y) : 0);
					location[2] += (xyz.z != 0 ? (newCoords[2] / xyz.z) : 0);

				}
				return location;
			}

			//[jscastro] added method to rotate on objects on an axis instead of centers
			obj.setRotationAxis = function (xyz) {
				if (typeof xyz === 'number') xyz = { z: xyz }

				let bb = obj.modelBox();

				let point = new THREE.Vector3(bb.max.x, bb.max.y, bb.min.z);
				//apply Axis rotation on angle
				if (xyz.x != 0) _applyAxisAngle(obj, point, new THREE.Vector3(0, 0, 1), xyz.x);
				if (xyz.y != 0) _applyAxisAngle(obj, point, new THREE.Vector3(0, 0, 1), xyz.y);
				if (xyz.z != 0) _applyAxisAngle(obj, point, new THREE.Vector3(0, 0, 1), xyz.z);
			}

			//[jscastro] Auxiliar method to rotate an object on an axis
			function _applyAxisAngle(model, point, axis, degrees) {
				let theta = utils.radify(degrees);
				model.position.sub(point); // remove the offset
				model.position.applyAxisAngle(axis, theta); // rotate the POSITION
				model.position.add(point); // re-add the offset
				model.rotateOnAxis(axis, theta)

				map.repaint = true;
			}

			let _boundingBox;
			//[jscastro] added property for boundingBox helper
			Object.defineProperty(obj, 'boundingBox', {
				get() { return _boundingBox; },
				set(value) {
					_boundingBox = value;
				}
			})

			let _boundingBoxShadow;
			//[jscastro] added property for boundingBox helper
			Object.defineProperty(obj, 'boundingBoxShadow', {
				get() { return _boundingBoxShadow; },
				set(value) {
					_boundingBoxShadow = value;
				}
			})

			//[jscastro] added method to create a bounding box and a shadow box
			obj.drawBoundingBox = function () {
				//let's create 2 wireframes, one for the object and one to project on the floor position
				let bb = obj.box3();
				//create the group to return
				let boxGrid = new THREE.Group();
				boxGrid.name = "BoxGrid";
				boxGrid.updateMatrixWorld(true);
				let boxModel = new THREE.Box3Helper(bb, Objects.prototype._defaults.colors.yellow);
				boxModel.name = "BoxModel";
				boxGrid.add(boxModel);
				boxModel.layers.disable(0); // it makes the object invisible for the raycaster
				obj.boundingBox = boxModel;

				//it needs to clone, to avoid changing the object by reference
				let bb2 = bb.clone();
				//we make the second box flat and at the floor height level
				bb2.max.z = bb2.min.z;
				let boxShadow = new THREE.Box3Helper(bb2, Objects.prototype._defaults.colors.black);
				boxShadow.name = "BoxShadow";

				boxGrid.add(boxShadow);
				boxShadow.layers.disable(0); // it makes the object invisible for the raycaster
				obj.boundingBoxShadow = boxShadow;

				boxGrid.visible = false; // visibility is managed from the parent
				return boxGrid;
			}

			//[jscastro] added method to position the shadow box on the floor depending the object height
			obj.setBoundingBoxShadowFloor = function () {
				if (obj.boundingBox) {
					obj.boundingBoxShadow.box.max.z = -obj.modelHeight;
					obj.boundingBoxShadow.box.min.z = -obj.modelHeight;
				}
			}

			//[jscastro] Set the positional and pivotal anchor automatically from string param
			obj.setAnchor = function (anchor) {
				const box = obj.box3();
				const size = box.getSize(new THREE.Vector3());
				const center = box.getCenter(new THREE.Vector3());
				obj.center = { x: center.x, y: center.y, z: box.min.z };
				obj.bottom = { x: center.x, y: box.max.y, z: box.min.z };
				obj.bottomLeft = { x: box.max.x, y: box.max.y, z: box.min.z };
				obj.bottomRight = { x: box.min.x, y: box.max.y, z: box.min.z };
				obj.top = { x: center.x, y: box.min.y, z: box.min.z };
				obj.topLeft = { x: box.max.x, y: box.min.y, z: box.min.z };
				obj.topRight = { x: box.min.x, y: box.min.y, z: box.min.z };
				obj.left = { x: box.max.x, y: center.y, z: box.min.z };
				obj.right = { x: box.min.x, y: center.y, z: box.min.z };

				switch (anchor) {
					case 'center':
					case 'auto':
						obj.anchor = obj.center;
						break;
					case 'top':
						obj.anchor = obj.top;
						break;
					case 'top-left':
						obj.anchor = obj.topLeft;
						break;
					case 'top-right':
						obj.anchor = obj.topRight;
						break;
					case 'left':
						obj.anchor = obj.left;
						break;
					case 'right':
						obj.anchor = obj.right;
						break;
					case 'bottom':
						obj.anchor = obj.bottom;
						break;
					case 'bottom-left':
					default:
						obj.anchor = obj.bottomLeft;
						break;
					case 'bottom-right':
						obj.anchor = obj.bottomRight;
						break;
				}

				obj.model.position.set(-obj.anchor.x, -obj.anchor.y, -obj.anchor.z);

			}
			//[jscastro] Set the positional and pivotal anchor based on (x, y, z) size units
			obj.setCenter = function (center) {
				//[jscastro] if the object options have an adjustment to center the 3D Object different to 0
				if (center && (center.x != 0 || center.y != 0 || center.z != 0)) {
					let size = obj.getSize();
					obj.anchor = { x: -(size.x * center.x), y: -(size.y * center.y), z: -(size.z * center.z) };
					obj.model.position.set(-obj.anchor.x, -obj.anchor.y, -obj.anchor.z)
				}
			}

			let _label;
			//[jscastro] added property for wireframes state
			Object.defineProperty(obj, 'label', {
				get() { return _label; },
				set(value) {
					_label = value;
				}
			});

			let _tooltip;
			//[jscastro] added property for simulated tooltip
			Object.defineProperty(obj, 'tooltip', {
				get() { return _tooltip; },
				set(value) {
					_tooltip = value;
				}
			});

			//[jscastro] added property to redefine visible, including the label and tooltip
			Object.defineProperty(obj, 'visibility', {
				get() { return obj.visible; },
				set(value) {
					let _value = value;
					if (value == 'visible' || value == true) {
						_value = true;
						if (obj.label) obj.label.visible = _value;
					}
					else if (value == 'none' || value == false) {
						_value = false;
						if (obj.label && obj.label.alwaysVisible) obj.label.visible = _value;
						if (obj.tooltip) obj.tooltip.visible = _value;
					}
					else return;
					if (obj.visible != _value) {
						obj.visible = _value;

						if (obj.model) {
							obj.model.traverse(function (c) {
								if (c.type == "Mesh" || c.type == "SkinnedMesh") {
									if (_value) {
										c.layers.enable(0); //this makes the meshes visible for raycast
									} else {
										c.layers.disable(0); //this makes the meshes invisible for raycast
									}
								}
								if (c.type == "LineSegments") {
									c.layers.disableAll();
								}
							});
						}
					}
				}
			});

			//[jscastro] add CSS2 label method
			obj.addLabel = function (HTMLElement, visible = false, center = obj.anchor) {
				if (HTMLElement) {
					//we add it to the first children to get same boxing and position
					//obj.children[0].add(obj.drawLabel(text, height));
					obj.children[0].add(obj.drawLabelHTML(HTMLElement, visible, center));
				}
			}

			//[jscastro] draw label method can be invoked separately
			obj.drawLabelHTML = function (HTMLElement, visible = false, center = obj.anchor) {
				let div = root.drawLabelHTML(HTMLElement, Objects.prototype._defaults.label.cssClass);
				const box = obj.box3();
				const size = box.getSize(new THREE.Vector3());
				let bottomLeft = { x: box.max.x, y: box.max.y, z: box.min.z };
				if (obj.label) { obj.label.remove; obj.label = null; }
				obj.label = new CSS2D.CSS2DObject(div);
				obj.label.position.set(((-size.x * 0.5) - obj.model.position.x - center.x + bottomLeft.x), ((-size.y * 0.5) - obj.model.position.y - center.y + bottomLeft.y), size.z * 0.5); //middle-centered
				obj.label.visible = visible;
				obj.label.alwaysVisible = visible;

				return obj.label;
			}

			//[jscastro] add tooltip method
			obj.addTooltip = function (tooltipText, mapboxStyle = false, center = obj.anchor) {
				if (tooltipText) {
					let divToolTip = root.drawTooltip(tooltipText, mapboxStyle);
					const box = obj.box3();
					const size = box.getSize(new THREE.Vector3());
					let bottomLeft = { x: box.max.x, y: box.max.y, z: box.min.z };
					if (obj.tooltip) { obj.tooltip.remove; obj.tooltip = null; }
					obj.tooltip = new CSS2D.CSS2DObject(divToolTip);
					obj.tooltip.position.set(((-size.x * 0.5) - obj.model.position.x - center.x + bottomLeft.x), ((-size.y * 0.5) - obj.model.position.y - center.y + bottomLeft.y), size.z); //top-centered
					obj.tooltip.visible = false; //only visible on mouseover or selected
					//we add it to the first children to get same boxing and position
					obj.children[0].add(obj.tooltip);
				}
			}

			let _wireframe = false;
			//[jscastro] added property for wireframes state
			Object.defineProperty(obj, 'wireframe', {
				get() { return _wireframe; },
				set(value) {
					if (_wireframe != value) {

						obj.model.traverse(function (c) {
							if (c.type == "Mesh" || c.type == "SkinnedMesh") {
								let arrMaterial = [];
								if (!Array.isArray(c.material)) {
									arrMaterial.push(c.material);
								} else {
									arrMaterial = c.material;
								}
								arrMaterial.forEach(function (m) {
									m.opacity = (value ? 0.5 : 1);
									//m.transparent = value;
									m.wireframe = value;
								});
								if (value) { c.layers.disable(0); c.layers.enable(1); } else { c.layers.disable(1); c.layers.enable(0); }
							}
							if (c.type == "LineSegments") {
								c.layers.disableAll();
							}
						});
						_wireframe = value;
						// Dispatch new event WireFramed
						obj.dispatchEvent(new CustomEvent('Wireframed', { detail: obj, bubbles: true, cancelable: true }));
					}
				}
			})

			let _selected = false;
			//[jscastro] added property for selected state
			Object.defineProperty(obj, 'selected', {
				get() { return _selected; },
				set(value) {
					if (value) {
						if (obj.boundingBox) {
							obj.boundingBox.material = Objects.prototype._defaults.materials.boxSelectedMaterial;
							obj.boundingBox.parent.visible = true;
							obj.boundingBox.layers.enable(1);
							obj.boundingBoxShadow.layers.enable(1);
						}
						if (obj.label && !obj.label.alwaysVisible) obj.label.visible = true;
					}
					else {
						if (obj.boundingBox) {
							obj.boundingBox.parent.visible = false;
							obj.boundingBox.layers.disable(1);
							obj.boundingBoxShadow.layers.disable(1);
							obj.boundingBox.material = Objects.prototype._defaults.materials.boxNormalMaterial;
						}
						if (obj.label && !obj.label.alwaysVisible) obj.label.visible = false;
					}
					if (obj.tooltip) obj.tooltip.visible = value;
					//only fire the event if value is different
					if (_selected != value) {
						_selected = value;
						// Dispatch new event SelectedChange
						obj.dispatchEvent(new CustomEvent('SelectedChange', { detail: obj, bubbles: true, cancelable: true }));
					}
				}
			})

			let _over = false;
			//[jscastro] added property for over state
			Object.defineProperty(obj, 'over', {
				get() { return _over; },
				set(value) {
					if (value) {
						if (!obj.selected) {
							if (obj.boundingBox) {
								obj.boundingBox.material = Objects.prototype._defaults.materials.boxOverMaterial;
								obj.boundingBox.parent.visible = true;
								obj.boundingBox.layers.enable(1);
								obj.boundingBoxShadow.layers.enable(1);
							}
						}
						if (obj.label && !obj.label.alwaysVisible) { obj.label.visible = true; }
						// Dispatch new event ObjectOver
						obj.dispatchEvent(new CustomEvent('ObjectMouseOver', { detail: obj, bubbles: true, cancelable: true }));

					}
					else {
						if (!obj.selected) {
							if (obj.boundingBox) {
								obj.boundingBox.parent.visible = false;
								obj.boundingBox.layers.disable(1);
								obj.boundingBoxShadow.layers.disable(1);
								obj.boundingBox.material = Objects.prototype._defaults.materials.boxNormalMaterial;
							}
							if (obj.label && !obj.label.alwaysVisible) { obj.label.visible = false; }
						}
						// Dispatch new event ObjectOver
						obj.dispatchEvent(new CustomEvent('ObjectMouseOut', { detail: obj, bubbles: true, cancelable: true }));
					}
					if (obj.tooltip) obj.tooltip.visible = value || obj.selected;
					_over = value;
				}
			})

			//[jscastro] get the object model Box3 in runtime
			obj.box3 = function () {
				//update Matrix and MatrixWorld to avoid issues with transformations not full applied
				obj.updateMatrix();
				obj.updateMatrixWorld(true, true);
				let bounds;
				//clone also the model inside it's the one who keeps the real size
				if (obj.model) {
					//let's clone the object before manipulate it
					let dup = obj.clone(true);
					dup.model = obj.model.clone();
					//get the size of the model because the object is translated and has boundingBoxShadow
					bounds = new THREE.Box3().setFromObject(dup.model);
					//if the object has parent it's already in the added to world so it's scaled and it could be rotated
					if (obj.parent) {
						//first, we return the object to it's original position of rotation, extract rotation and apply inversed
						let rm = new THREE.Matrix4();
						let rmi = new THREE.Matrix4();
						obj.matrix.extractRotation(rm);
						rm.getInverse(rmi);
						dup.setRotationFromMatrix(rmi);
						//now the object inside will give us a NAABB Non-Axes Aligned Bounding Box
						bounds = new THREE.Box3().setFromObject(dup.model);
					}
				}
				return bounds;
			};

			//[jscastro] modelBox
			obj.modelBox = function () {
				return obj.box3();
			}

			obj.getSize = function () {
				return obj.box3().getSize(new THREE.Vector3(0, 0, 0));
			}

			//[jscastro]
			let _modelSize = false;
			//[jscastro] added property for wireframes state
			Object.defineProperty(obj, 'modelSize', {
				get() {
					_modelSize = obj.getSize();
					//console.log(_modelSize);
					return _modelSize;
				},
				set(value) {
					if (_modelSize != value) {
						_modelSize = value;
					}
				}
			})

			//[jscastro]
			obj.modelHeight = 0;

		}

		obj.add = function () {
			tb.add(obj);
			if (!isStatic) obj.set({ position: obj.coordinates });
			return obj;
		}

		obj.remove = function () {
			tb.remove(obj);
			tb.map.repaint = true;
		}

		//[jscastro] clone + assigning all the attributes
		obj.duplicate = function () {
			var dupe = obj.clone(true);
			dupe.userData = obj.userData;
			dupe.model = dupe.children[0].children[0];
			dupe.animations = dupe.model.animations;
			root._addMethods(dupe);
			dupe.deepCopy(obj);

			return dupe;
		}

		obj.deepCopy = function (o) {

			obj.anchor = o.anchor;
			obj.bottom = o.bottom;
			obj.bottomLeft = o.bottomLeft;
			obj.bottomRight = o.bottomRight;
			obj.center = o.center;
			obj.left = o.left;
			obj.right = o.right;
			obj.top = o.top;
			obj.topLeft = o.topLeft;
			obj.topRight = o.topRight;
			obj.boundingBox = obj.children[0].children[1].children[0];
			obj.boundingBoxShadow = obj.children[0].children[1].children[1];
			obj.tooltip = obj.children[0].children[2];

			return obj;
		}

		obj.dispose = function () {
			if (obj.label) { obj.label.dispose() };
			if (obj.tooltip) { obj.tooltip.dispose() };
			if (obj.model) { obj.model = {} };
		}

		return obj
	},

	_makeGroup: function (obj, options) {
		var geoGroup = new THREE.Group();
		geoGroup.userData = options || {};
		geoGroup.userData.isGeoGroup = true;
		if (geoGroup.userData.feature) {
			geoGroup.userData.feature.properties.uuid = geoGroup.uuid;
		}
		var isArrayOfObjects = obj.length;

		if (isArrayOfObjects) for (o of obj) geoGroup.add(o)


		else geoGroup.add(obj);

		utils._flipMaterialSides(obj);

		return geoGroup
	},

	animationManager: new AnimationManager,

	//[jscastro] add tooltip method
	drawTooltip : function (tooltipText, mapboxStyle = false) {
		if (tooltipText) {
			let divToolTip;
			if (mapboxStyle) {
				let divContent = document.createElement('div');
				divContent.className = 'mapboxgl-popup-content';
				let strong = document.createElement('strong');
				strong.innerHTML = tooltipText;
				divContent.appendChild(strong);
				let tip = document.createElement('div');
				tip.className = 'mapboxgl-popup-tip';
				let div = document.createElement('div');
				div.className = 'marker mapboxgl-popup-anchor-bottom';
				div.appendChild(tip);
				div.appendChild(divContent);
				divToolTip = document.createElement('div');
				divToolTip.className += 'label3D';
				divToolTip.appendChild(div);
			}
			else {
				divToolTip = document.createElement('span');
				divToolTip.className = this._defaults.tooltip.cssClass;
				divToolTip.innerHTML = tooltipText;
			}
			return divToolTip;
		}
	},

	//[jscastro] draw label method can be invoked separately
	drawLabelHTML: function (HTMLElement, cssClass) {
		let div = document.createElement('div');
		div.className += cssClass;
		// [jscastro] create a div [TODO] analize if must be moved
		if (typeof (HTMLElement) == 'string') {
			div.innerHTML = HTMLElement;
		} else {
			div.innerHTML = HTMLElement.outerHTML;
		}
		//div.style.marginTop = '-' + bottomMargin + 'em';
		return div;
	},

	_defaults: {
		colors: {
			red: new THREE.Color(0xff0000),
			yellow: new THREE.Color(0xffff00),
			green: new THREE.Color(0x00ff00),
			black: new THREE.Color(0x000000)
		},

		materials: {
			boxNormalMaterial: new THREE.LineBasicMaterial({ color: new THREE.Color(0xff0000) }),
			boxOverMaterial: new THREE.LineBasicMaterial({ color: new THREE.Color(0xffff00) }),
			boxSelectedMaterial: new THREE.LineBasicMaterial({ color: new THREE.Color(0x00ff00) })
		},

		line: {
			geometry: null,
			color: 'black',
			width: 1,
			opacity: 1
		},

		sphere: {
			position: [0, 0, 0],
			radius: 1,
			sides: 20,
			units: 'scene',
			material: 'MeshBasicMaterial',
			anchor: 'bottom-left'
		},

		label: {
			htmlElement: null,
			cssClass: " label3D",
			alwaysVisible: false,
			topMargin: -0.5,
			feature: null
		},

		tooltip: {
			text: '',
			cssClass: 'toolTip text-xs',
			mapboxStyle: false,
			topMargin: 0,
			feature: null
		},

		tube: {
			geometry: null,
			radius: 1,
			sides: 6,
			units: 'scene',
			material: 'MeshBasicMaterial',
			anchor: 'center'
		},

		extrusion: {
			footprint: null,
			base: 0,
			top: 100,
			color: 'black',
			material: 'MeshBasicMaterial',
			scaleToLatitude: false
		},

		loadObj: {
			type: null,
			obj: null,
			units: 'scene',
			scale: 1,
			rotation: 0,
			defaultAnimation: 0,
			anchor: 'bottom-left'
		},

		Object3D: {
			obj: null,
			units: 'scene',
			anchor: 'bottom-left'
		}
	},

	geometries: {
		line: ['LineString'],
		tube: ['LineString'],
		sphere: ['Point'],
	}
}

module.exports = exports = Objects;
