/**
 * @author jscastro / https://github.com/jscastro76
 */

var CSS2D = require("./CSS2DRenderer.js");

function LabelRenderer(map) {

	this.map = map;

	this.minzoom = map.minzoom;

	this.maxzoom = map.maxzoom;

	var zoomEventHandler;
	var onZoomRange = true;

	this.renderer = new CSS2D.CSS2DRenderer();

	this.renderer.setSize(this.map.getCanvas().clientWidth, this.map.getCanvas().clientHeight);
	this.renderer.domElement.style.position = 'absolute';
	this.renderer.domElement.id = 'labelCanvas'; //TODO: this value must come by parameter
	this.renderer.domElement.style.top = 0;
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

	this.render = function (scene, camera) {
		this.scene = scene;
		this.camera = camera;
		this.renderer.render(scene, camera);
	}

	this.setZoomRange = function (minzoom, maxzoom) {
		//[jscastro] we only attach once if there are multiple custom layers
		if (!zoomEventHandler) {
			this.minzoom = minzoom;
			this.maxzoom = maxzoom;
			zoomEventHandler = this.mapZoom.bind(this);
			this.map.on('zoom', zoomEventHandler);
		}
	};

	this.mapZoom = function (e) {
		if (this.map.getZoom() < this.minzoom || this.map.getZoom() > this.maxzoom) {
			this.toggleLabels(false);
		} else {
			this.toggleLabels(true);
		}
	};

	//[jscastro] method to toggle Layer visibility
	this.toggleLabels = function (visible) {
		if (onZoomRange != visible) {
			// [jscastro] Render any label
			this.setVisibility(visible, this.scene, this.camera, this.renderer);
			onZoomRange = visible;
		}
	};

	//[jscastro] method to set visibility
	this.setVisibility = function (visible, scene, camera, renderer) {
		var cache = this.renderer.cacheList;
		cache.forEach(function (l) {
			if (l.visible != visible) {
				if ((visible && l.alwaysVisible) || !visible) {
					l.visible = visible;
					renderer.renderObject(l, scene, camera);
				}
			}
		});
	};

}

module.exports = exports = LabelRenderer;
