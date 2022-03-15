/**
 * @author peterqliu / https://github.com/peterqliu
 * @author jscastro / https://github.com/jscastro76
 */
const utils = require("../utils/utils.js");
const material = require("../utils/material.js");
const THREE = require('../three.js');
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

	unenroll: function (obj, isStatic) {
		var root = this;

		if (isStatic) {

		}

		else {
			// Bestow this mesh with animation superpowers and keeps track of its movements in the global animation queue			
			root.animationManager.unenroll(obj);

		}

	},

	_addMethods: function (obj, isStatic) {

		var root = this;
		const labelName = "label";
		const tooltipName = "tooltip";
		const helpName = "help";
		const shadowPlane = "shadowPlane";

		if (isStatic) {

		}

		else {
			
			if (!obj.coordinates) obj.coordinates = [0, 0, 0];

			//[jscastro] added property for the internal 3D model
			Object.defineProperty(obj, 'model', {
				get() {
					return obj.getObjectByName("model");
				}
			});

			let _animations;
			//[jscastro] added property for the internal 3D model
			Object.defineProperty(obj, 'animations', {
				get() {
					const model = obj.model;
					if (model) {
						return model.animations
					} else return null;
				},
				//set(value) { _animations = value}
			});

			// Bestow this mesh with animation superpowers and keeps track of its movements in the global animation queue			
			root.animationManager.enroll(obj);

			// Place an object on the map at the given lnglat 
			obj.setCoords = function (lnglat) {

				// CSS2DObjects could bring an specific vertical positioning to correct in units
				if (obj.userData.topMargin && obj.userData.feature) {
					lnglat[2] += ((obj.userData.feature.properties.height || 0) - (obj.userData.feature.properties.base_height || obj.userData.feature.properties.min_height || 0)) * (obj.userData.topMargin || 0);
				}

				obj.coordinates = lnglat;
				obj.set({ position: lnglat });
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

				tb.map.repaint = true;
			}


			//[jscastro] added property for scaled group inside threeboxObject
			Object.defineProperty(obj, 'scaleGroup', {
				get() {
					return obj.getObjectByName("scaleGroup");
				}
			})

			//[jscastro] added property for boundingBox group helper
			Object.defineProperty(obj, 'boxGroup', {
				get() {
					return obj.getObjectByName("boxGroup");
				}
			})

			//[jscastro] added property for boundingBox helper
			Object.defineProperty(obj, 'boundingBox', {
				get() {
					return obj.getObjectByName("boxModel");
				}
			})

			let _boundingBoxShadow;
			//[jscastro] added property for boundingBox shadow helper
			Object.defineProperty(obj, 'boundingBoxShadow', {
				get() {
					return obj.getObjectByName("boxShadow");
				}
			})

			//[jscastro] added method to create a bounding box and a shadow box
			obj.drawBoundingBox = function () {
				//let's create 2 wireframes, one for the object and one to project on the floor position
				let bb = obj.box3();
				//create the group to return
				let boxGroup = new THREE.Group();
				boxGroup.name = "boxGroup";
				boxGroup.updateMatrixWorld(true);
				let boxModel = new THREE.Box3Helper(bb, Objects.prototype._defaults.colors.yellow);
				boxModel.name = "boxModel";
				boxGroup.add(boxModel);
				boxModel.layers.disable(0); // it makes the object invisible for the raycaster
				//obj.boundingBox = boxModel;

				//it needs to clone, to avoid changing the object by reference
				let bb2 = bb.clone();
				//we make the second box flat and at the floor height level
				bb2.max.z = bb2.min.z;
				let boxShadow = new THREE.Box3Helper(bb2, Objects.prototype._defaults.colors.black);
				boxShadow.name = "boxShadow";

				boxGroup.add(boxShadow);
				boxShadow.layers.disable(0); // it makes the object invisible for the raycaster
				//obj.boundingBoxShadow = boxShadow;

				boxGroup.visible = false; // visibility is managed from the parent
				obj.scaleGroup.add(boxGroup);
				obj.setBoundingBoxShadowFloor();
			}

			//[jscastro] added method to position the shadow box on the floor depending the object height
			obj.setBoundingBoxShadowFloor = function () {
				if (obj.boundingBoxShadow) {
					let h = -obj.modelHeight, r = obj.rotation, o = obj.boundingBoxShadow;
					o.box.max.z = o.box.min.z = h;
					o.rotation.y = r.y;
					o.rotation.x = -r.x;
				}
			}

			//[jscastro] Set the positional and pivotal anchor automatically from string param  
			obj.setAnchor = function (anchor) {
				const b = obj.box3();
				//const size = b.getSize(new THREE.Vector3());
				const c = b.getCenter(new THREE.Vector3());
				obj.none = { x: 0, y: 0, z: 0 };
				obj.center = { x: c.x, y: c.y, z: b.min.z };
				obj.bottom = { x: c.x, y: b.max.y, z: b.min.z };
				obj.bottomLeft = { x: b.max.x, y: b.max.y, z: b.min.z };
				obj.bottomRight = { x: b.min.x, y: b.max.y, z: b.min.z };
				obj.top = { x: c.x, y: b.min.y, z: b.min.z };
				obj.topLeft = { x: b.max.x, y: b.min.y, z: b.min.z };
				obj.topRight = { x: b.min.x, y: b.min.y, z: b.min.z };
				obj.left = { x: b.max.x, y: c.y, z: b.min.z };
				obj.right = { x: b.min.x, y: c.y, z: b.min.z };

				switch (anchor) {
					case 'center':
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
					case 'auto':
					case 'none':
						obj.anchor = obj.none;
				}

				obj.model.position.set(-obj.anchor.x, -obj.anchor.y, -obj.anchor.z);

			}

			//[jscastro] Set the positional and pivotal anchor based on (x, y, z) size units
			obj.setCenter = function (center) {
				//[jscastro] if the object options have an adjustment to center the 3D Object different to 0
				if (center && (center.x != 0 || center.y != 0 || center.z != 0)) {
					let size = obj.getSize();
					obj.anchor = { x: obj.anchor.x - (size.x * center.x), y: obj.anchor.y - (size.y * center.y), z: obj.anchor.z - (size.z * center.z) };
					obj.model.position.set(-obj.anchor.x, -obj.anchor.y, -obj.anchor.z)
				}
			}

			//[jscastro] added property for simulated label
			Object.defineProperty(obj, 'label', {
				get() { return obj.getObjectByName(labelName); }
			});

			//[jscastro] added property for simulated tooltip
			Object.defineProperty(obj, 'tooltip', {
				get() { return obj.getObjectByName(tooltipName); }
			});

			//[jscastro] added property for help
			Object.defineProperty(obj, 'help', {
				get() { return obj.getObjectByName(helpName); }
			});

			let _hidden = false;
			//[jscastro] added property for explicitely hidden object to avoid zoom layer behavior
			Object.defineProperty(obj, 'hidden', {
				get() { return _hidden; },
				set(value) {
					if (_hidden != value) {
						_hidden = value;
						obj.visibility = !_hidden;
					}
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
						if (obj.hidden && _value) return;

						obj.visible = _value;

						if (obj.model) {
							obj.model.traverse(function (c) {
								if (c.type == "Mesh" || c.type == "SkinnedMesh") {
									if (_value && obj.raycasted) {
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
			obj.addLabel = function (HTMLElement, visible, center, height) {
				if (HTMLElement) {
					//we add it to the first children to get same boxing and position
					//obj.children[0].add(obj.drawLabel(text, height));
					obj.drawLabelHTML(HTMLElement, visible, center, height);
				}
			}

			//[jscastro] remove CSS2 label method 
			obj.removeLabel = function () {
				obj.removeCSS2D(labelName);
			}

			//[jscastro] draw label method can be invoked separately
			obj.drawLabelHTML = function (HTMLElement, visible = false, center = obj.anchor, height = 0.5) {
				let divLabel = root.drawLabelHTML(HTMLElement, Objects.prototype._defaults.label.cssClass);
				let label = obj.addCSS2D(divLabel, labelName, center, height) //label.position.set(((-size.x * 0.5) - obj.model.position.x - center.x + bottomLeft.x), ((-size.y * 0.5) - obj.model.position.y - center.y + bottomLeft.y), size.z * 0.5); //middle-centered
				label.alwaysVisible = visible;
				label.visible = visible;
				return label;
			}

			//[jscastro] add tooltip method 
			obj.addTooltip = function (tooltipText, mapboxStyle, center, custom = true, height = 1) {
				let t = obj.addHelp(tooltipText, tooltipName, mapboxStyle, center, height);
				t.visible = false;
				t.custom = custom;
			}

			//[jscastro] remove CSS2 tooltip method
			obj.removeTooltip = function () {
				obj.removeCSS2D(tooltipName);
			}

			//[jscastro] add tooltip method 
			obj.addHelp = function (helpText, objName = helpName, mapboxStyle = false, center = obj.anchor, height = 0) {
				let divHelp = root.drawTooltip(helpText, mapboxStyle);
				let h = obj.addCSS2D(divHelp, objName, center, height);
				h.visible = true;
				return h;
			}

			//[jscastro] remove CSS2 tooltip method
			obj.removeHelp = function () {
				obj.removeCSS2D(helpName);
			}

			//[jscastro] add CSS2D help method 
			obj.addCSS2D = function (element, objName, center = obj.anchor, height = 1) {
				if (element) {
					const box = obj.box3();
					const size = box.getSize(new THREE.Vector3());
					let bottomLeft = { x: box.max.x, y: box.max.y, z: box.min.z };
					obj.removeCSS2D(objName);
					let c = new CSS2D.CSS2DObject(element);
					c.name = objName;
					c.position.set(((-size.x * 0.5) - obj.model.position.x - center.x + bottomLeft.x), ((-size.y * 0.5) - obj.model.position.y - center.y + bottomLeft.y), size.z * height); 
					c.visible = false; //only visible on mouseover or selected
					obj.scaleGroup.add(c);
					return c;
				}
			}

			//[jscastro] remove CSS2 help method
			obj.removeCSS2D = function (objName) {
				let css2D = obj.getObjectByName(objName);
				if (css2D) {
					css2D.dispose();
					let g = obj.scaleGroup.children;
					g.splice(g.indexOf(css2D), 1);
				}
			}

			//[jscastro] added property for help
			Object.defineProperty(obj, 'shadowPlane', {
				get() { return obj.getObjectByName(shadowPlane); }
			});

			let _castShadow = false;
			//[jscastro] added property for traverse an object to cast a shadow
			Object.defineProperty(obj, 'castShadow', {
				get() { return _castShadow; },
				set(value) {
					if (!obj.model || _castShadow === value) return;

					obj.model.traverse(function (c) {
						if (c.isMesh) c.castShadow = true;
					});
					if (value) {
						// we add the shadow plane automatically 
						const s = obj.modelSize;
						const sz = [s.x, s.y, s.z, obj.modelHeight];
						const pSize = Math.max(...sz) * 10;
						const pGeo = new THREE.PlaneBufferGeometry(pSize, pSize);
						const pMat = new THREE.ShadowMaterial();
						//const pMat = new THREE.MeshStandardMaterial({ color: 0x660000 });
						pMat.opacity = 0.5;
						let p = new THREE.Mesh(pGeo, pMat);
						p.name = shadowPlane;
						p.layers.enable(1); p.layers.disable(0); // it makes the object invisible for the raycaster
						p.receiveShadow = value;
						obj.add(p);
					} else {
						// or we remove it 
						obj.traverse(function (c) {
							if (c.isMesh && c.material instanceof THREE.ShadowMaterial)
								obj.remove(c);
						});

					}
					_castShadow = value;

				}
			})

			//[jscastro] added method to position the shadow box on the floor depending the object height
			obj.setReceiveShadowFloor = function () {
				if (obj.castShadow) {
					let sp = obj.shadowPlane, p = sp.position, r = sp.rotation;
					p.z = -obj.modelHeight;
					r.y = obj.rotation.y;
					r.x = -obj.rotation.x;
					if (obj.userData.units === 'meters') {
						const s = obj.modelSize;
						const sz = [s.x, s.y, s.z, -p.z];
						const ps = Math.max(...sz) * 10;
						const sc = ps / sp.geometry.parameters.width;
						sp.scale.set(sc, sc, sc);
					}
				}
			}

			let _receiveShadow = false;
			//[jscastro] added property for traverse an object to receive a shadow
			Object.defineProperty(obj, 'receiveShadow', {
				get() { return _receiveShadow; },
				set(value) {
					if (!obj.model || _receiveShadow === value) return;
					obj.model.traverse(function (c) {
						if (c.isMesh) c.receiveShadow = true;
					});
					_receiveShadow = value;
				}
			})

			let _wireframe = false;
			//[jscastro] added property for wireframes state
			Object.defineProperty(obj, 'wireframe', {
				get() { return _wireframe; },
				set(value) {
					if (!obj.model || _wireframe === value) return;
					obj.model.traverse(function (c) {
						if (c.type == "Mesh" || c.type == "SkinnedMesh") {
							let materials = [];
							if (!Array.isArray(c.material)) {
								materials.push(c.material);
							} else {
								materials = c.material;
							}
							let m = materials[0];
							if (value) {
								c.userData.materials = m;
								c.material = m.clone();
								c.material.wireframe = c.material.transparent = value;
								c.material.opacity = 0.3;
							} else {
								c.material.dispose();
								c.material = c.userData.materials;
								c.userData.materials.dispose();
								c.userData.materials = null;
							}

							if (value) { c.layers.disable(0); c.layers.enable(1); } else { c.layers.disable(1); c.layers.enable(0); }
						}
						if (c.type == "LineSegments") {
							c.layers.disableAll();
						}
					});
					_wireframe = value;
					// Dispatch new event WireFramed
					obj.dispatchEvent({ type: 'Wireframed', detail: obj });
				}
			})

			let _color = null;
			//[jscastro] added property for wireframes state
			Object.defineProperty(obj, 'color', {
				get() { return _color; },
				set(value) {
					if (!obj.model || _color === value) return;
					obj.model.traverse(function (c) {
						if (c.type == "Mesh" || c.type == "SkinnedMesh") {
							let materials = [];
							if (!Array.isArray(c.material)) {
								materials.push(c.material);
							} else {
								materials = c.material;
							}
							let m = materials[0];
							if (value) {
								c.userData.materials = m;
								c.material = new THREE.MeshStandardMaterial();
								c.material.color.setHex(value);
							} else {
								c.material.dispose();
								c.material = c.userData.materials;
								c.userData.materials.dispose();
								c.userData.materials = null;
							}

						}
					});
					_color = value;
				}
			})


			let _selected = false;
			//[jscastro] added property for selected state
			Object.defineProperty(obj, 'selected', {
				get() { return _selected; },
				set(value) {
					if (value) {
						if (obj.userData.bbox && !obj.boundingBox) obj.drawBoundingBox();
						if (obj.boxGroup) {
							obj.boundingBox.material = Objects.prototype._defaults.materials.boxSelectedMaterial;
							obj.boundingBox.parent.visible = true;
							obj.boundingBox.layers.enable(1);
							obj.boundingBoxShadow.layers.enable(1);
						}
						if (obj.label && !obj.label.alwaysVisible) obj.label.visible = true;
					}
					else {
						if (obj.boxGroup) {
							obj.remove(obj.boxGroup); //remove the box group
						}
						if (obj.label && !obj.label.alwaysVisible) obj.label.visible = false;
						obj.removeHelp();
					}
					if (obj.tooltip) obj.tooltip.visible = value;
					//only fire the event if value is different
					if (_selected != value) {
						_selected = value;
						// Dispatch new event SelectedChange
						obj.dispatchEvent({ type: 'SelectedChange', detail: obj });
					}
				}
			})

			let _raycasted = true;
			//[jscastro] added property for including/excluding an object from raycast
			Object.defineProperty(obj, 'raycasted', {
				get() { return _raycasted; },
				set(value) {
					if (!obj.model || _raycasted === value) return;
					obj.model.traverse(function (c) {
						if (c.type == "Mesh" || c.type == "SkinnedMesh") {
							if (!value) { c.layers.disable(0); c.layers.enable(1); } else { c.layers.disable(1); c.layers.enable(0); }
						}
					});
					_raycasted = value;
				}
			});

			let _over = false;
			//[jscastro] added property for over state
			Object.defineProperty(obj, 'over', {
				get() { return _over; },
				set(value) {
					if (value) {
						if (!obj.selected) {
							if (obj.userData.bbox && !obj.boundingBox) obj.drawBoundingBox();
							if (obj.userData.tooltip && !obj.tooltip) obj.addTooltip(obj.uuid, true, obj.anchor, false);
							if (obj.boxGroup) {
								obj.boundingBox.material = Objects.prototype._defaults.materials.boxOverMaterial;
								obj.boundingBox.parent.visible = true;
								obj.boundingBox.layers.enable(1);
								obj.boundingBoxShadow.layers.enable(1);
							}
						}
						if (obj.label && !obj.label.alwaysVisible) { obj.label.visible = true; }
						// Dispatch new event ObjectOver
						obj.dispatchEvent({ type: 'ObjectMouseOver', detail: obj });

					}
					else {
						if (!obj.selected) {
							if (obj.boxGroup) {
								obj.remove(obj.boxGroup); //remove the box group
								if (obj.tooltip && !obj.tooltip.custom) obj.removeTooltip();
							}
							if (obj.label && !obj.label.alwaysVisible) { obj.label.visible = false; }
						}
						// Dispatch new event ObjectOver
						obj.dispatchEvent({ type: 'ObjectMouseOut', detail: obj });
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
					let model = obj.model.clone();
					//get the size of the model because the object is translated and has boundingBoxShadow
					bounds = new THREE.Box3().setFromObject(model);
					//if the object has parent it's already in the added to world so it's scaled and it could be rotated
					if (obj.parent) {
						//first, we return the object to it's original position of rotation, extract rotation and apply inversed
						let rm = new THREE.Matrix4();
						let rmi = new THREE.Matrix4();
						obj.matrix.extractRotation(rm);
						rmi.copy(rm).invert();
						dup.setRotationFromMatrix(rmi);
						//now the object inside will give us a NAABB Non-Axes Aligned Bounding Box 
						bounds = new THREE.Box3().setFromObject(model);
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
					return _modelSize;
				},
				set(value) {
					if (_modelSize != value) {
						_modelSize = value;
					}
				}
			})


			//[jscastro] added property to get modelHeight
			Object.defineProperty(obj, 'modelHeight', {
				get() {
					let h = obj.coordinates[2] || 0;
					if (obj.userData.units === 'scene') h *= (obj.unitsPerMeter / obj.scale.x);
					return h;
				}
			});

			//[jscastro] added property to calculate the units per meter in a given latitude
			//reduced to 7 decimals to avoid deviations on the size of the same object  
			Object.defineProperty(obj, 'unitsPerMeter', {
				get() { return Number(utils.projectedUnitsPerMeter(obj.coordinates[1]).toFixed(7)); }
			});

			let _fixedZoom = null;
			//[jscastro] added property to have a fixed scale for some objects
			Object.defineProperty(obj, 'fixedZoom', {
				get() { return obj.userData.fixedZoom; },
				set(value) {
					if (obj.userData.fixedZoom === value) return;
					obj.userData.fixedZoom = value;
					obj.userData.units = (value ? 'scene' : 'meters');
				}
			});

			//[jscastro] sets the scale of an object based fixedZoom
			obj.setFixedZoom = function (scale) {
				if (obj.fixedZoom != null && obj.fixedZoom != 0) {
					if (!scale) scale = obj.userData.mapScale;
					let s = zoomScale(obj.fixedZoom);
					if (s > scale) {
						let calc = s / scale;
						obj.scale.set(calc, calc, calc);
					} else {
						obj.scale.set(1, 1, 1);
					}
				}
			}

			//[jscastro] sets the scale of an object based in the scale and fixedZoom
			obj.setScale = function (scale) {
				// scale the model so that its units are interpreted as meters at the given latitude
				if (obj.userData.units != 'scene') {
					let s = obj.unitsPerMeter;
					obj.scale.set(s, s, s);
				} else if (obj.fixedZoom) {
					if (scale) obj.userData.mapScale = scale;
					obj.setFixedZoom(obj.userData.mapScale); //apply fixed zoom
				} else obj.scale.set(1, 1, 1);
			} 

			function zoomScale(zoom) { return Math.pow(2, zoom); }

			//[jscastro] sets the scale and shadows position of an object based in the scale
			obj.setObjectScale = function (scale) {
				obj.setScale(scale);
				obj.setBoundingBoxShadowFloor();
				obj.setReceiveShadowFloor();
			} 

		}

		obj.add = function (o) {
			obj.scaleGroup.add(o);
			o.position.z = (obj.coordinates[2] ? -obj.coordinates[2] : 0);
			return o;
		}

		obj.remove = function (o) {
			if (!o) return;
			o.traverse(m => {
				//console.log('dispose geometry!')
				if (m.geometry) m.geometry.dispose();
				if (m.material) {
					if (m.material.isMaterial) {
						cleanMaterial(m.material)
					} else {
						// an array of materials
						for (const material of m.material) cleanMaterial(material)
					}
				}
				if (m.dispose) m.dispose();
			})

			obj.scaleGroup.remove(o);
			tb.map.repaint = true;
		}

		//[jscastro] clone + assigning all the attributes
		obj.duplicate = function (options) {

			let dupe = obj.clone(true);	//clone the whole threebox object
			dupe.getObjectByName("model").animations = obj.animations; //we must set this explicitly before addMethods
			if (dupe.userData.feature) {
				if (options && options.feature) dupe.userData.feature = options.feature;
				dupe.userData.feature.properties.uuid = dupe.uuid;
			}
			root._addMethods(dupe); // add methods

			if (!options || utils.equal(options.scale, obj.userData.scale)) {
				//no options, no changes, just return the same object
				dupe.copyAnchor(obj); // copy anchors
				//[jscastro] we add by default a tooltip that can be overriden later or hide it with threebox `enableTooltips`
				return dupe;
			} else {
				dupe.userData = options;
				dupe.userData.isGeoGroup = true;
				dupe.remove(dupe.boxGroup);
				// [jscastro] rotate and scale the model
				const r = utils.types.rotation(options.rotation, [0, 0, 0]);
				const s = utils.types.scale(options.scale, [1, 1, 1]);
				// [jscastro] reposition to 0,0,0
				dupe.model.position.set(0, 0, 0);
				// rotate and scale
				dupe.model.rotation.set(r[0], r[1], r[2]);
				dupe.model.scale.set(s[0], s[1], s[2]);
				//[jscastro] calculate automatically the pivotal center of the object
				dupe.setAnchor(options.anchor);
				//[jscastro] override the center calculated if the object has adjustments
				dupe.setCenter(options.adjustment);
				return dupe;

			}

		}

		//[jscastro] copy anchor values
		obj.copyAnchor = function (o) {

			obj.anchor = o.anchor;
			obj.none = { x: 0, y: 0, z: 0 };
			obj.center = o.center;
			obj.bottom = o.bottom;
			obj.bottomLeft = o.bottomLeft;
			obj.bottomRight = o.bottomRight;
			obj.top = o.top;
			obj.topLeft = o.topLeft;
			obj.topRight = o.topRight;
			obj.left = o.left;
			obj.right = o.right;

		}

		obj.dispose = function () {

			Objects.prototype.unenroll(obj);

			obj.traverse(o => {
				//don't dispose th object itself as it will be recursive
				if (o.parent && o.parent.name == "world") return;
				if (o.name === "threeboxObject") return;

				//console.log('dispose geometry!')
				if (o.geometry) o.geometry.dispose();

				if (o.material) {
					if (o.material.isMaterial) {
						cleanMaterial(o.material)
					} else {
						// an array of materials
						for (const material of o.material) cleanMaterial(material)
					}
				}
				if (o.dispose) o.dispose();

			})

			obj.children = [];

		}

		const cleanMaterial = material => {
			//console.log('dispose material!')
			material.dispose()

			// dispose textures
			for (const key of Object.keys(material)) {
				const value = material[key]
				if (value && typeof value === 'object' && 'minFilter' in value) {
					//console.log('dispose texture!')
					value.dispose()
				}
			}
			let m = material;
			let md = (m.map || m.alphaMap || m.aoMap || m.bumpMap || m.displacementMap || m.emissiveMap || m.envMap || m.lightMap || m.metalnessMap || m.normalMap || m.roughnessMap)
			if (md) {
				if (m.map) m.map.dispose();
				if (m.alphaMap) m.alphaMap.dispose();
				if (m.aoMap) m.aoMap.dispose();
				if (m.bumpMap) m.bumpMap.dispose();
				if (m.displacementMap) m.displacementMap.dispose();
				if (m.emissiveMap) m.emissiveMap.dispose();
				if (m.envMap) m.envMap.dispose();
				if (m.lightMap) m.lightMap.dispose();
				if (m.metalnessMap) m.metalnessMap.dispose();
				if (m.normalMap) m.normalMap.dispose();
				if (m.roughnessMap) m.roughnessMap.dispose();
			}
		}

		return obj
	},

	_makeGroup: function (obj, options) {
		let projScaleGroup = new THREE.Group();
		projScaleGroup.name = "scaleGroup";
		projScaleGroup.add(obj)

		var geoGroup = new THREE.Group();
		geoGroup.userData = options || {};
		geoGroup.userData.isGeoGroup = true;
		if (geoGroup.userData.feature) {
			geoGroup.userData.feature.properties.uuid = geoGroup.uuid;
		}
		var isArrayOfObjects = projScaleGroup.length;
		if (isArrayOfObjects) for (o of projScaleGroup) geoGroup.add(o)
		else geoGroup.add(projScaleGroup);

		//utils._flipMaterialSides(projScaleGroup);
		geoGroup.name = "threeboxObject";

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

		label: {
			htmlElement: null,
			cssClass: " label3D",
			alwaysVisible: false,
			topMargin: -0.5
		},

		tooltip: {
			text: '',
			cssClass: 'toolTip text-xs',
			mapboxStyle: false,
			topMargin: 0
		},

		sphere: {
			position: [0, 0, 0],
			radius: 1,
			sides: 20,
			units: 'scene',
			material: 'MeshBasicMaterial',
			anchor: 'bottom-left',
			bbox: true,
			tooltip: true,
			raycasted: true

		},

		tube: {
			geometry: null,
			radius: 1,
			sides: 6,
			units: 'scene',
			material: 'MeshBasicMaterial',
			anchor: 'center',
			bbox: true,
			tooltip: true,
			raycasted: true
		},

		loadObj: {
			type: null,
			obj: null,
			units: 'scene',
			scale: 1,
			rotation: 0,
			defaultAnimation: 0,
			anchor: 'bottom-left',
			bbox: true,
			tooltip: true,
			raycasted: true,
			clone: true
		},

		Object3D: {
			obj: null,
			units: 'scene',
			anchor: 'bottom-left',
			bbox: true,
			tooltip: true, 
			raycasted: true
		},

		extrusion: {
			coordinates: [[[]]],
			geometryOptions: {},
			height: 100,
			materials: new THREE.MeshPhongMaterial({ color: 0x660000, side: THREE.DoubleSide }),
			scale: 1,
			rotation: 0,
			units: 'scene',
			anchor: 'center',
			bbox: true,
			tooltip: true,
			raycasted: true

		}
	},

	geometries: {
		line: ['LineString'],
		tube: ['LineString'],
		sphere: ['Point'],
	}
}

module.exports = exports = Objects;