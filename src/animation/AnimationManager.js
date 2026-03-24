/**
 * @author peterqliu / https://github.com/peterqliu
 * @author jscastro / https://github.com/jscastro76
*/
const THREE = require('../three.js');
const utils = require("../utils/utils.js");

function AnimationManager(map) {

    this.map = map
    this.enrolledObjects = [];    
    this.previousFrameTime;

};

AnimationManager.prototype = {

	unenroll: function (obj) {
		this.enrolledObjects.splice(this.enrolledObjects.indexOf(obj), 1);
	},

	enroll: function (obj) {

		//[jscastro] add the object default animations
		obj.clock = new THREE.Clock();
		obj.hasDefaultAnimation = false;
		obj.defaultAction;
		obj.actions = [];
		obj.mixer;

		//[jscastro] if the object includes animations
		if (obj.animations && obj.animations.length > 0) {

			obj.hasDefaultAnimation = true;

			//check first if a defaultAnimation is defined by options
			let daIndex = (obj.userData.defaultAnimation ? obj.userData.defaultAnimation : 0);
			obj.mixer = new THREE.AnimationMixer(obj);

			setAction(daIndex);
		}

		//[jscastro] set the action to play
		function setAction(animationIndex) {
			for (let i = 0; i < obj.animations.length; i++) {

				if (animationIndex > obj.animations.length)
					console.log("The animation index " + animationIndex + " doesn't exist for this object");
				let animation = obj.animations[i];
				let action = obj.mixer.clipAction(animation);
				obj.actions.push(action);

				//select the default animation and set the weight to 1
				if (animationIndex === i) {
					obj.defaultAction = action;
					action.setEffectiveWeight(1);
				}
				else {
					action.setEffectiveWeight(0);
				}
				action.play();

			}
		}

		let _isPlaying = false;
		//[jscastro] added property for isPlaying state
		Object.defineProperty(obj, 'isPlaying', {
			get() { return _isPlaying; },
			set(value) {
				if (_isPlaying != value) {
					_isPlaying = value;
					// Dispatch new event IsPlayingChanged
					obj.dispatchEvent({ type: 'IsPlayingChanged', detail: obj});
				}
			}
		})

		/* Extend the provided object with animation-specific properties and track in the animation manager */
		this.enrolledObjects.push(obj);

		// Give this object its own internal animation queue
		obj.animationQueue = [];

		obj.set = function (options) {

			//if duration is set, animate to the new state
			if (options.duration > 0) {

				let newParams = {
					start: Date.now(),
					expiration: Date.now() + options.duration,
					endState: {}
				}

				utils.extend(options, newParams);

				let translating = options.coords;
				let rotating = options.rotation;
				let scaling = options.scale || options.scaleX || options.scaleY || options.scaleZ;

				if (rotating) {

					let r = obj.rotation;
					options.startRotation = [r.x, r.y, r.z];


					options.endState.rotation = utils.types.rotation(options.rotation, options.startRotation);
					options.rotationPerMs = options.endState.rotation
						.map(function (angle, index) {
							return (angle - options.startRotation[index]) / options.duration;
						})
				}

				if (scaling) {
					let s = obj.scale;
					options.startScale = [s.x, s.y, s.z];
					options.endState.scale = utils.types.scale(options.scale, options.startScale);

					options.scalePerMs = options.endState.scale
						.map(function (scale, index) {
							return (scale - options.startScale[index]) / options.duration;
						})
				}

				if (translating) options.pathCurve = new THREE.CatmullRomCurve3(utils.lnglatsToWorld([obj.coordinates, options.coords]));

				let entry = {
					type: 'set',
					parameters: options
				}

				this.animationQueue
					.push(entry);

				tb.map.repaint = true;
			}

			//if no duration set, stop object's existing animations and go to that state immediately
			else {
				this.stop();
				options.rotation = utils.radify(options.rotation);
				this._setObject(options);
			}

			return this

		};

		//[jscastro] animation method, is set by update method
		obj.animationMethod = null;

		//[jscastro] stop animation and the queue
		obj.stop = function (index) {
			if (obj.mixer) {
				obj.isPlaying = false;
				cancelAnimationFrame(obj.animationMethod);
			}
			//TODO: if this is removed, it produces an error in 
			this.animationQueue = [];
			return this;
		}

		obj.followPath = function (options, cb) {

			let entry = {
				type: 'followPath',
				parameters: utils._validate(options, defaults.followPath)
			};

			utils.extend(
				entry.parameters,
				{
					pathCurve: new THREE.CatmullRomCurve3(
						utils.lnglatsToWorld(options.path)
					),
					start: Date.now(),
					expiration: Date.now() + entry.parameters.duration,
					cb: cb
				}
			);

			this.animationQueue
				.push(entry);

			tb.map.repaint = true;

			return this;
		};

		obj._setObject = function (options) {

			//default scale always
			obj.setScale();

			let p = options.position; // lnglat
			let r = options.rotation; // radians
			let s = options.scale; // custom scale
			let w = options.worldCoordinates; //Vector3
			let q = options.quaternion; // [axis, angle in rads]
			let t = options.translate; // [jscastro] lnglat + height for 3D objects
			let wt = options.worldTranslate; // [jscastro] Vector3 translation

			if (p) {
				this.coordinates = p;
				let c = utils.projectToWorld(p);
				this.position.copy(c)
			}

			if (t) {
				this.coordinates = [this.coordinates[0] + t[0], this.coordinates[1] + t[1], this.coordinates[2] + t[2]];
				let c = utils.projectToWorld(t);
				this.position.copy(c)
				//this.translateX(c.x);
				//this.translateY(c.y);
				//this.translateZ(c.z);
				options.position = this.coordinates;
			}

			if (wt) {
				this.translateX(wt.x);
				this.translateY(wt.y);
				this.translateZ(wt.z);
				let p = utils.unprojectFromWorld(this.position);
				this.coordinates = options.position = p;
			}

			if (r) {
				this.rotation.set(r[0], r[1], r[2]);
				options.rotation = new THREE.Vector3(r[0], r[1], r[2]);
			}

			if (s) {
				this.scale.set(s[0], s[1], s[2]);
				options.scale = this.scale;
			}

			if (q) {
				this.quaternion.setFromAxisAngle(q[0], q[1]);
				options.rotation = q[0].multiplyScalar(q[1]);
			}

			if (w) {
				this.position.copy(w);
				let p = utils.unprojectFromWorld(w);
				this.coordinates = options.position = p;
			} 

			//Each time the object is positioned, project the floor and correct shadow plane
			this.setBoundingBoxShadowFloor();
			this.setReceiveShadowFloor();

			this.updateMatrixWorld();
			tb.map.repaint = true;

			//const threeTarget = new THREE.EventDispatcher();
			//threeTarget.dispatchEvent({ type: 'event', detail: { object: this, action: { position: options.position, rotation: options.rotation, scale: options.scale } } });
			// fire the ObjectChanged event to notify UI object change
			let e = { type: 'ObjectChanged', detail: { object: this, action: { position: options.position, rotation: options.rotation, scale: options.scale } } };
			this.dispatchEvent(e);

		};

		//[jscastro] play default animation
		obj.playDefault = function (options) {
			if (obj.mixer && obj.hasDefaultAnimation) {

				let newParams = {
					start: Date.now(),
					expiration: Date.now() + options.duration,
					endState: {}
				}

				utils.extend(options, newParams);

				obj.mixer.timeScale = options.speed || 1;

				let entry = {
					type: 'playDefault',
					parameters: options
				};

				this.animationQueue
					.push(entry);

				tb.map.repaint = true
				return this;
			}
		}

		//[jscastro] play an animation, requires options.animation as an index, if not it will play the default one
		obj.playAnimation = function (options) {
			if (obj.mixer) {

				if (options.animation>=0) {
					setAction(options.animation)
				}
				obj.playDefault(options);

			}
		}

		//[jscastro] pause all actions animation
		obj.pauseAllActions = function () {
			if (obj.mixer) {
				obj.actions.forEach(function (action) {
					action.paused = true;
				});
			}
		}

		//[jscastro] unpause all actions
		obj.unPauseAllActions = function () {
			if (obj.mixer) {
				obj.actions.forEach(function (action) {
					action.paused = false;
				});
			}

		}

		//[jscastro] stop all actions
		obj.deactivateAllActions = function () {
			if (obj.mixer) {
				obj.actions.forEach(function (action) {
					action.stop();
				});
			}
		}

		//[jscastro] play all actions
		obj.activateAllActions = function () {
			if (obj.mixer) {
				obj.actions.forEach(function (action) {
					action.play();
				});
			}
		}

		//[jscastro] move the model action one tick just to avoid issues with initial position
		obj.idle = function () {
			if (obj.mixer) {
				// Update the animation mixer and render this frame
				obj.mixer.update(0.01);
			}
			tb.map.repaint = true;
			return this;
		}

	},

	update: function (now) {

		if (this.previousFrameTime === undefined) this.previousFrameTime = now;

		let dimensions = ['X', 'Y', 'Z'];

		//[jscastro] when function expires this produces an error
		if (!this.enrolledObjects) return false;

		//iterate through objects in queue. count in reverse so we can cull objects without frame shifting
		for (let a = this.enrolledObjects.length - 1; a >= 0; a--) {

			let object = this.enrolledObjects[a];

			if (!object.animationQueue || object.animationQueue.length === 0) continue;

			//[jscastro] now multiple animations on a single object is possible
			for (let i = object.animationQueue.length - 1; i >= 0; i--) {

				//focus on first item in queue
				let item = object.animationQueue[i];
				if (!item) continue;
				let options = item.parameters;

				// if an animation is past its expiration date, cull it
				if (!options.expiration) {
					// console.log('culled')

					object.animationQueue.splice(i, 1);

					// set the start time of the next animation
					if (object.animationQueue[i]) object.animationQueue[i].parameters.start = now;

					return
				}

				//if finished, jump to end state and flag animation entry for removal next time around. Execute callback if there is one
				let expiring = now >= options.expiration;

				if (expiring) {
					options.expiration = false;
					if (item.type === 'playDefault') {
						object.stop();
					} else {
						if (options.endState) object._setObject(options.endState);
						if (typeof (options.cb) != 'undefined') options.cb();
					}
				}

				else {

					let timeProgress = (now - options.start) / options.duration;

					if (item.type === 'set') {

						let objectState = {};

						if (options.pathCurve) objectState.worldCoordinates = options.pathCurve.getPoint(timeProgress);

						if (options.rotationPerMs) {
							objectState.rotation = options.startRotation.map(function (rad, index) {
								return rad + options.rotationPerMs[index] * timeProgress * options.duration
							})
						}

						if (options.scalePerMs) {
							objectState.scale = options.startScale.map(function (scale, index) {
								return scale + options.scalePerMs[index] * timeProgress * options.duration
							})
						}

						object._setObject(objectState);
					}

					if (item.type === 'followPath') {

						let position = options.pathCurve.getPointAt(timeProgress);
						let objectState = { worldCoordinates: position };

						// if we need to track heading
						if (options.trackHeading) {

							let tangent = options.pathCurve
								.getTangentAt(timeProgress)
								.normalize();

							let axis = new THREE.Vector3(0, 0, 0);
							let up = new THREE.Vector3(0, 1, 0);

							axis
								.crossVectors(up, tangent)
								.normalize();

							let radians = Math.acos(up.dot(tangent));

							objectState.quaternion = [axis, radians];

						}

						object._setObject(objectState);

					}

					//[jscastro] play default animation
					if (item.type === 'playDefault') {
						object.activateAllActions();
						object.isPlaying = true;
						object.animationMethod = requestAnimationFrame(this.update);
						object.mixer.update(object.clock.getDelta());
						tb.map.repaint = true;
					}

				}
			}

		}

		this.previousFrameTime = now;
	}

}

const defaults = {
    followPath: {
        path: null,
        duration: 1000,
        trackHeading: true
    }
}
module.exports = exports = AnimationManager;