/**
 * @author mrdoob / http://mrdoob.com/
 */

const THREE = require('three');
THREE.CSS2DObject = function (element) {

	THREE.Object3D.call(this);

	this.element = element || document.createElement('div');

	this.element.style.position = 'absolute';

	//[jscastro] some labels must be always visible
	this.alwaysVisible = false;

	this.dispose = function () {
		this.remove();
	}

	this.remove = function () {
		this.traverse(function (object) {

			if (object.element instanceof Element && object.element.parentNode !== null) {

				object.element.parentNode.removeChild(object.element);

			}

		});
	}

	this.addEventListener('removed', function () {

		this.remove();

	});

};

THREE.CSS2DObject.prototype = Object.assign(Object.create(THREE.Object3D.prototype), {

	constructor: THREE.CSS2DObject,

	copy: function (source, recursive) {

		THREE.Object3D.prototype.copy.call(this, source, recursive);

		this.element = source.element.cloneNode(true);

		return this;

	}

});

THREE.CSS2DRenderer = function () {

	var _this = this;

	var _width, _height;
	var _widthHalf, _heightHalf;

	var vector = new THREE.Vector3();
	var viewMatrix = new THREE.Matrix4();
	var viewProjectionMatrix = new THREE.Matrix4();

	var cache = {
		objects: new WeakMap(),
		list: new Map()
	};
	this.cacheList = cache.list;
	var domElement = document.createElement('div');
	domElement.style.overflow = 'hidden';

	this.domElement = domElement;

	this.getSize = function () {

		return {
			width: _width,
			height: _height
		};

	};

	this.setSize = function (width, height) {

		_width = width;
		_height = height;

		_widthHalf = _width / 2;
		_heightHalf = _height / 2;

		domElement.style.width = width + 'px';
		domElement.style.height = height + 'px';

	};

	this.renderObject = function (object, scene, camera) {

		if (object instanceof THREE.CSS2DObject) {

			//[jscastro] optimize performance and don't update and remove the labels that are not visible
			if (!object.visible) { object.remove(); }
			else {

				object.onBeforeRender(_this, scene, camera);

				vector.setFromMatrixPosition(object.matrixWorld);
				vector.applyMatrix4(viewProjectionMatrix);

				var element = object.element;
				var style = 'translate(-50%,-50%) translate(' + (vector.x * _widthHalf + _widthHalf) + 'px,' + (- vector.y * _heightHalf + _heightHalf) + 'px)';

				element.style.WebkitTransform = style;
				element.style.MozTransform = style;
				element.style.oTransform = style;
				element.style.transform = style;

				element.style.display = (object.visible && vector.z >= - 1 && vector.z <= 1) ? '' : 'none';

				var objectData = {
					distanceToCameraSquared: getDistanceToSquared(camera, object)
				};

				cache.objects.set(object, objectData);
				cache.list.set(object, object);

				if (element.parentNode !== domElement) {

					domElement.appendChild(element);

				}

				object.onAfterRender(_this, scene, camera);
			}
		}

		for (var i = 0, l = object.children.length; i < l; i++) {

			this.renderObject(object.children[i], scene, camera);

		}

	};

	var getDistanceToSquared = function () {

		var a = new THREE.Vector3();
		var b = new THREE.Vector3();

		return function (object1, object2) {

			a.setFromMatrixPosition(object1.matrixWorld);
			b.setFromMatrixPosition(object2.matrixWorld);

			return a.distanceToSquared(b);

		};

	}();

	var filterAndFlatten = function (scene) {

		var result = [];

		scene.traverse(function (object) {

			if (object instanceof THREE.CSS2DObject) result.push(object);

		});

		return result;

	};

	var zOrder = function (scene) {

		var sorted = filterAndFlatten(scene).sort(function (a, b) {
			//[jscastro] check the objects already exist in the cache
			let cacheA = cache.objects.get(a);
			let cacheB = cache.objects.get(b);

			if (cacheA && cacheB) {
				var distanceA = cacheA.distanceToCameraSquared;
				var distanceB = cacheB.distanceToCameraSquared;

				return distanceA - distanceB;
			}

		});

		var zMax = sorted.length;

		for (var i = 0, l = sorted.length; i < l; i++) {

			sorted[i].element.style.zIndex = zMax - i;

		}

	};

	this.render = function (scene, camera) {

		if (scene.autoUpdate === true) scene.updateMatrixWorld();
		if (camera.parent === null) camera.updateMatrixWorld();

		viewMatrix.copy(camera.matrixWorldInverse);
		viewProjectionMatrix.multiplyMatrices(camera.projectionMatrix, viewMatrix);

		this.renderObject(scene, scene, camera);
		zOrder(scene);

	};

	this.setVisibility = function (visible, scene, camera) {
		var a = cache.objects;
		cache.list.forEach(function (l) {
			l.visible = visible;
			this.renderObject(l, scene, camera);
		});
	};

};

module.exports = exports = { CSS2DRenderer: THREE.CSS2DRenderer, CSS2DObject: THREE.CSS2DObject };

