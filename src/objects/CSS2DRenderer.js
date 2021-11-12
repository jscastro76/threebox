/**
 * @author mrdoob / http://mrdoob.com/
 */

const THREE = require('three');

(function () {

	class CSS2DObject extends THREE.Object3D {

		constructor(element) {

			super();
			this.element = element || document.createElement('div');
			this.element.style.position = 'absolute';
			this.element.style.userSelect = 'none';
			this.element.setAttribute('draggable', false);

			//[jscastro] some labels must be always visible
			this.alwaysVisible = false;

			//[jscastro] layer is needed to be rendered/hidden based on layer visibility
			Object.defineProperty(this, 'layer', {
				get() { return (this.parent && this.parent.parent ? this.parent.parent.layer : null) }
			});

			//[jscastro] implement dispose
			this.dispose = function () {
				this.remove();
				this.element = null;
			}
			//[jscastro] implement explicit method
			this.remove = function () {
				if (this.element instanceof Element && this.element.parentNode !== null) {
					this.element.parentNode.removeChild(this.element);
				}
			}

			this.addEventListener('removed', function () {

				this.remove();

			});

		}

		copy(source, recursive) {

			super.copy(source, recursive);
			this.element = source.element.cloneNode(true);
			return this;

		}

	}

	CSS2DObject.prototype.isCSS2DObject = true; //

	const _vector = new THREE.Vector3();

	const _viewMatrix = new THREE.Matrix4();

	const _viewProjectionMatrix = new THREE.Matrix4();

	const _a = new THREE.Vector3();

	const _b = new THREE.Vector3();

	class CSS2DRenderer {

		constructor() {

			const _this = this;

			let _width, _height;

			let _widthHalf, _heightHalf;

			const cache = {
				objects: new WeakMap(),
				list: new Map()
			};
			this.cacheList = cache.list;
			const domElement = document.createElement('div');
			domElement.style.overflow = 'hidden';
			this.domElement = domElement;

			this.getSize = function () {

				return {
					width: _width,
					height: _height
				};

			};

			this.render = function (scene, camera) {

				if (scene.autoUpdate === true) scene.updateMatrixWorld();
				if (camera.parent === null) camera.updateMatrixWorld();

				_viewMatrix.copy(camera.matrixWorldInverse);

				_viewProjectionMatrix.multiplyMatrices(camera.projectionMatrix, _viewMatrix);

				renderObject(scene, scene, camera);
				zOrder(scene);

			};

			this.setSize = function (width, height) {

				_width = width;
				_height = height;
				_widthHalf = _width / 2;
				_heightHalf = _height / 2;
				domElement.style.width = width + 'px';
				domElement.style.height = height + 'px';

			};

			function renderObject(object, scene, camera) {

				if (object.isCSS2DObject) {

					//[jscastro] optimize performance and don't update and remove the labels that are not visible
					if (!object.visible) {
						cache.objects.delete({ key: object.uuid });
						cache.list.delete(object.uuid);
						object.remove();
					}
					else {

						object.onBeforeRender(_this, scene, camera);

						_vector.setFromMatrixPosition(object.matrixWorld);

						_vector.applyMatrix4(_viewProjectionMatrix);

						const element = object.element;
						var style;
						if (/apple/i.test(navigator.vendor)) {

							// https://github.com/mrdoob/three.js/issues/21415
							style = 'translate(-50%,-50%) translate(' + Math.round(_vector.x * _widthHalf + _widthHalf) + 'px,' + Math.round(- _vector.y * _heightHalf + _heightHalf) + 'px)';

						} else {

							style = 'translate(-50%,-50%) translate(' + (_vector.x * _widthHalf + _widthHalf) + 'px,' + (- _vector.y * _heightHalf + _heightHalf) + 'px)';

						}

						element.style.WebkitTransform = style;
						element.style.MozTransform = style;
						element.style.oTransform = style;
						element.style.transform = style;

						element.style.display = object.visible && _vector.z >= - 1 && _vector.z <= 1 ? '' : 'none';

						const objectData = {
							distanceToCameraSquared: getDistanceToSquared(camera, object)
						};

						cache.objects.set({ key: object.uuid }, objectData);
						cache.list.set(object.uuid, object);

						if (element.parentNode !== domElement) {

							domElement.appendChild(element);

						}

						object.onAfterRender(_this, scene, camera);

					}
				}

				for (let i = 0, l = object.children.length; i < l; i++) {

					renderObject(object.children[i], scene, camera);

				}
				

			}

			function getDistanceToSquared(object1, object2) {

				_a.setFromMatrixPosition(object1.matrixWorld);

				_b.setFromMatrixPosition(object2.matrixWorld);

				return _a.distanceToSquared(_b);

			}

			function filterAndFlatten(scene) {

				const result = [];
				scene.traverse(function (object) {

					if (object.isCSS2DObject) result.push(object);

				});
				return result;

			}

			function zOrder(scene) {

				const sorted = filterAndFlatten(scene).sort(function (a, b) {
					//[jscastro] check the objects already exist in the cache
					let cacheA = cache.objects.get({ key: a.uuid });
					let cacheB = cache.objects.get({ key: b.uuid });

					if (cacheA && cacheB) {
						const distanceA = cacheA.distanceToCameraSquared;
						const distanceB = cacheB.distanceToCameraSquared;
						return distanceA - distanceB;
					}

				});

				const zMax = sorted.length;

				for (let i = 0, l = sorted.length; i < l; i++) {

					sorted[i].element.style.zIndex = zMax - i;

				}

			}

		}

	}

	THREE.CSS2DObject = CSS2DObject;
	THREE.CSS2DRenderer = CSS2DRenderer;

})();

module.exports = exports = { CSS2DRenderer: THREE.CSS2DRenderer, CSS2DObject: THREE.CSS2DObject };

