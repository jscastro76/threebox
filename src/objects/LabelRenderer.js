/**
 * @author jscastro / https://github.com/jscastro76
 */

const THREE = require("./CSS2DRenderer.js");

function LabelRenderer(map) {

	this.map = map;

	this.renderer = new THREE.CSS2DRenderer();

	this.renderer.setSize(this.map.getCanvas().clientWidth, this.map.getCanvas().clientHeight);
	this.renderer.domElement.style.position = 'absolute';
	this.renderer.domElement.id = 'labelCanvas'; //TODO: this value must come by parameter
	this.renderer.domElement.style.top = 0;
	this.renderer.domElement.style.zIndex = "0";
	this.map.getCanvasContainer().appendChild(this.renderer.domElement);

	this.scene, this.camera;

	this.dispose = function () {
		this.map.getCanvasContainer().removeChild(this.renderer.domElement)
		this.renderer.domElement.remove();
		this.renderer = {};
	}

	this.setSize = function (width, height) {
		this.renderer.setSize(width, height);
	}

	this.map.on('resize', function () {
		this.renderer.setSize(this.map.getCanvas().clientWidth, this.map.getCanvas().clientHeight);
	}.bind(this));

	this.state = {
		reset: function () {
			//TODO: Implement a good state reset, check out what is made in WebGlRenderer
		}
	}

	this.render = async function (scene, camera) {
		this.scene = scene;
		this.camera = camera;
		return new Promise((resolve) => { resolve(this.renderer.render(scene, camera)) }); 
	}

	//[jscastro] method to toggle Layer visibility
	this.toggleLabels = async function (layerId, visible) {
		return new Promise((resolve) => {
			resolve(this.setVisibility(layerId, visible, this.scene, this.camera, this.renderer));
		}) 
	};

	//[jscastro] method to set visibility
	this.setVisibility = function (layerId, visible, scene, camera, renderer) {
		var cache = this.renderer.cacheList;
		cache.forEach(function (l) {
			if (l.visible != visible && l.layer === layerId) {
				if ((visible && l.alwaysVisible) || !visible) {
					l.visible = visible;
					renderer.renderObject(l, scene, camera);
				}
			}
		});
	};

}

module.exports = exports = LabelRenderer;
