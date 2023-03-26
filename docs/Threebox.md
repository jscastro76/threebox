# Threebox Documentation

<br>

## Background

Threebox works by adding a *Three.js* scene to *Mapbox GL*, creating a new *Mapbox GL* custom layer that implements [CustomLayerInterface](https://docs.mapbox.com/mapbox-gl-js/api/properties/#customlayerinterface). The custom layer API takes a fair amount of finessing to be useful, and Threebox tackles several hurdles to getting *Three.js* and *Mapbox GL* to work together. 

<br>

- - -

## Examples

Threebox contains [+20 examples](https://github.com/jscastro76/threebox/blob/master/examples/readme.md) to showcase most of its features. Check them out to have a glance of what is possible.  
To run them, create a `config.js` file with your Mapbox-gl-js access token, in the same folder and in the format of [the template](https://github.com/jscastro76/threebox/blob/master/examples/config_template.js).

- [01-basic.html](https://github.com/jscastro76/threebox/blob/master/examples/01-basic.html) 
- [02-line.html](https://github.com/jscastro76/threebox/blob/master/examples/02-line.html) 
- [03-tube.html](https://github.com/jscastro76/threebox/blob/master/examples/03-tube.html) 
- [04-mercator.html](https://github.com/jscastro76/threebox/blob/master/examples/04-mercator.html) 
- [05-logistics.html](https://github.com/jscastro76/threebox/blob/master/examples/05-logistics.html) 
- [06-object3d.html](https://github.com/jscastro76/threebox/blob/master/examples/06-object3d.html) 
- [07-alignmentTest.html](https://github.com/jscastro76/threebox/blob/master/examples/07-alignmentTest.html) 
- [08-3dbuildings.html](https://github.com/jscastro76/threebox/blob/master/examples/08-3dbuildings.html) 
- [09-raycaster.html](https://github.com/jscastro76/threebox/blob/master/examples/09-raycaster.html) 
- [10-stylechange.html](https://github.com/jscastro76/threebox/blob/master/examples/10-stylechange.html) 
- [11-animation.html](https://github.com/jscastro76/threebox/blob/master/examples/11-animation.html) 
- [12-add3dmodel.html](https://github.com/jscastro76/threebox/blob/master/examples/12-add3dmodel.html) 
- [13-eiffel.html](https://github.com/jscastro76/threebox/blob/master/examples/13-eiffel.html) 
- [14-buildingshadow.html](https://github.com/jscastro76/threebox/blob/master/examples/14-buildingshadow.html) 
- [15-performance.html](https://github.com/jscastro76/threebox/blob/master/examples/15-performance.html) 
- [16-multilayer.html](https://github.com/jscastro76/threebox/blob/master/examples/16-multilayer.html) 
- [17-azuremaps.html](https://github.com/jscastro76/threebox/blob/master/examples/17-azuremaps.html) 
- [18-extrusions.html](https://github.com/jscastro76/threebox/blob/master/examples/18-extrusions.html) 
- [19-fixedzoom.html](https://github.com/jscastro76/threebox/blob/master/examples/19-fixedzoom.html) 
- [20-game.html](https://github.com/jscastro76/threebox/blob/master/examples/20-game.html)
- [21-terrain.html](https://github.com/jscastro76/threebox/blob/master/examples/21-terrain.html) 
- [Vue.js sample](https://codesandbox.io/s/vue-threebox-sample-8k7mz)

<br>

- - -

## Threebox

### Using Threebox

You can use threebox in three different ways. 

#### NPM install
Add threebox to your project via **npm package** [![NPM version](http://img.shields.io/npm/v/threebox-plugin.svg?style=flat-square)](https://www.npmjs.org/package/threebox-plugin) :  
```js
npm install threebox-plugin
```  

Then you will need to import Threebox object in your code. Depending your javascript framework this might be different. 
```js 
import { Threebox } from 'threebox-plugin/dist/threebox'; 
```  
<br/>

#### Use the bundle locally
Download the bundle from [`dist/threebox.js`](dist/threebox.js) or [`dist/threebox.min.js`](dist/threebox.min.js) and include it in a `<script>` tag on your page.  
If you want to use styles predefined, add the link to the cascade style sheet, just ensure the `src` and `href` attributes are pointing to relative or absolute url path.  
```html
<script src="../dist/threebox.js" type="text/javascript"></script>
<link href="./css/threebox.css" rel="stylesheet" />
```
<br/>

#### Public CDNs
Threebox can be also used from different public CDNs:  

##### jsdelivr
This CDN has the particularity that always requires the version of the package to download individual files.
```html
<script src="https://cdn.jsdelivr.net/gh/jscastro76/threebox@v.2.2.1/dist/threebox.min.js" type="text/javascript"></script>
<link href="https://cdn.jsdelivr.net/gh/jscastro76/threebox@v.2.1.1/dist/threebox.css" rel="stylesheet" />
```
<br/>

##### unpkg
Despite this CDN admits version, if omitted, it will download always the last one published.

```html
<script src="https://unpkg.com/threebox-plugin/dist/threebox.min.js" type="text/javascript"></script>
<link href="https://unpkg.com/threebox-plugin/dist/threebox.css" rel="stylesheet" />
```

For an specific version (i.e. v2.2.1) use the followin:
```html
<script src="https://unpkg.com/threebox-plugin@2.2.1/dist/threebox.min.js" type="text/javascript"></script>
<link href="https://unpkg.com/threebox-plugin@2.2.1/dist/threebox.css" rel="stylesheet" />
```

<br/>

- - -

### Threebox instance

The instance of Threebox will be used normally across the full page, so it's recommended to be created at `window` scope to be used as a global variable.  
Creating a global instance might be producing memory leaks when you navigate to other pages without disposing properly the resources. You can use [`tb.dispose`](#dispose) method to fully dispose the instance of Threebox but also all mapbox and three.js resources together.

#### constructor

```js
var tb = new Threebox(map, glContext [, options])
```

Sets up a Threebox scene using an [Mapbox map](https://docs.mapbox.com/mapbox-gl-js/api/map/#map) and a [WebGLRenderingContext](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext), both of them can be obtained from *Mapbox GL map* instance.  
`options` param is optional and can contain the following values:

| option | required | default | type   | purpose                                                                                  |
|-----------|----------|---------|--------|----------------------------------------------------------------------------------------------|
| `defaultLights`    | no       | false      | boolean | Whether to add some default lighting to the scene. If no lighting added, most objects in the scene will render as black |
| `realSunlight`    | no       | false      | boolean | It sets lights that simulate Sun position for the map center coords `map.getCenter` and user local datetime `new Date()`. This sunlight can be updated through `tb.setSunlight` method. It calls internally to suncalc module. |
| `realSunlightHelper`    | no       | false      | boolean | It sets if a light helper will be shown when `realSunlight` is true. |
| `passiveRendering`     | no       | true   | boolean  | Color of line. Unlike other Threebox objects, this color will render on screen precisely as specified, regardless of scene lighting |
| `enableSelectingFeatures`     | no       | false   | boolean  | Enables the Mouseover and Selection of fill-extrusion features. This will fire the event [`SelectedFeatureChange`](#SelectedFeatureChange) |
| `enableSelectingObjects`     | no       | false   | boolean  | Enables the Mouseover and Selection of 3D objects. This will fire the event [`SelectedChange`](#SelectedChange). This value will set the `options.bbx` value of the objects created.|
| `enableDraggingObjects`     | no       | false   | boolean  | Enables to the option to Drag a 3D object. This will fire the event [`ObjectDragged`](#ObjectDragged) where `draggedAction = 'translate'` or `draggedAction = 'altitude'` |
| `enableRotatingObjects`     | no       | false   | boolean  | Enables to the option to Drag a 3D object. This will fire the event [`ObjectDragged`](#ObjectDragged)  where `draggedAction = 'rotate'`|
| `enableTooltips`     | no       | false   | boolean  | Enables the default tooltips on fill-extrusion features and 3D Objects|
| `enableHelpTooltips`     | no       | false   | boolean  | Enables the default help tooltips when an object is being moved, rotated or measured. |
| `multiLayer`     | no       | false   | boolean  | Enables the option for multi layer pages where a default layer will be created internally that will manage the [`tb.update`](#update) calls  |
| `orthographic`     | no       | false   | boolean  | Enables the option to set a [`THREE.OrthographicCamera`](https://threejs.org/docs/index.html#api/en/cameras/OrthographicCamera) instead of a `THREE.PerspectiveCamera` which is the default in Mapbox  |
| `fov`     | no       | ThreeboxConstants.FOV_DEGREES | number | Enables to set the FOV of the default [`THREE.PerspectiveCamera`](https://threejs.org/docs/index.html#api/en/cameras/PerspectiveCamera). This value has no effect if `orthographic: true`  |
| `sky`    | no       | false      | boolean | It sets a built-in atmospheric layer initially set with the time and the map center position. This layer is automatically updated if `realSunlight` is also true, but it can be updated separately through `tb.updateSunSky(tb.getSunSky())` method call. |
| `terrain`    | no       | false      | boolean | It sets a built-in terrain layer initially set with the time and the map center position. This layer is automatically updated if `realSunlight` is also true, but it can be updated separately through `tb.updateSunSky(tb.getSunSky())` method call. |

To render Threebox scene, first is needed to create a [CustomLayerInterface](https://docs.mapbox.com/mapbox-gl-js/api/properties/#customlayerinterface), and then add the 3D objects to render at [`onAdd` function](https://www.mapbox.com/mapbox-gl-js/api/#customlayerinterface).  
Second, you need to call recursively to [`tb.update();`](#update) method from 
[CustomLayerInterface `render` function](https://docs.mapbox.com/mapbox-gl-js/api/properties/#customlayerinterface#render).  
Threebox then automatically synchronizes the camera movement and events between *Three.js* and *Mapbox GL* JS.   

[WebGLRenderingContext](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext) instance can be obtained in different ways. The most usual one is to get the context from the instance of the member [`onAdd(map, gl)`](https://docs.mapbox.com/mapbox-gl-js/api/properties/#customlayerinterface#onadd).  
This method is quick and easy, but it implies that it's created only in every call to the method [`addLayer(layer[, beforeId])`](https://docs.mapbox.com/mapbox-gl-js/api/map/#map#addlayer)
```js
map.addLayer({
	id: 'custom_layer',
	type: 'custom',
	renderingMode: '3d',
	onAdd: function (map, gl) {

		window.tb = new Threebox(
			map,
			gl, //get the context from Mapbox
			{ defaultLights: true }
		);
		var geometry = new THREE.BoxGeometry(30, 60, 120);
		let cube = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({ color: 0x660000 }));
		cube = tb.Object3D({ obj: cube, units: 'meters' });
		cube.setCoords([-3.460539968876, 40.4849214450]);
		tb.add(cube);
	},
	render: function (gl, matrix) {
		tb.update(); //update Threebox scene
	}
}
```  

The second way is to get the context from the canvas of the *Mapbox GL* map [`map.getCanvas().getContext('webgl')`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext).  
In this way the creation of the Threebox can be instantiated separately from the `addLayer` method that is more useful for multiple layers and objects. In this way the instace will exist even if there are no custom layers created, so you have to take care to properly dispose the resources.

```js
window.tb = new Threebox(
	map,
	map.getCanvas().getContext('webgl'), //get the context from the map canvas
	{ defaultLights: true }
);
map.addLayer({
	id: 'custom_layer',
	type: 'custom',
	renderingMode: '3d',
	onAdd: function (map, gl) {
		var geometry = new THREE.BoxGeometry(30, 60, 120);
		let cube = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({ color: 0x660000 }));
		cube = tb.Object3D({ obj: cube, units: 'meters' });
		cube.setCoords([-3.460539968876, 40.4849214450]);
		tb.add(cube);
	},
	render: function (gl, matrix) {
		tb.update(); //update Threebox scene
	}
}

```
<br>

- - -

### Loading a 3D model

One of the most powerful capabilities of Threebox is the option to load 3D models from external files in different formats (OBJ/MTL, GLTF/GLB, FBX, DAE are supported). 
Once the model is loaded and added to Threebox, the object is powered by default with some methods, interactions, events and animations. 

Once the object is loaded and added to Threebox instance, it can be **selectable**, **draggable** and **rotable** (over the z axis) 
with the mouse if Threebox instance properties [`enableSelectingObjects`](#enableselectingfeatures), [`enableDraggingObjects`](#enableDraggingObjects) and 
[`enableRotatingObjects`](#enableRotatingObjects) are set to `true`.

- To **drag** an object you have to select the object and then press **SHIFT** key and move the mouse to change its Lnglat position, and **CTRL** key to change its altitude.
- To **rotate** and object you have to select the object and then press **ALT** key and move the mouse. The object will always rotate over its defined center.

Any 3D object (including 3D extrusions created through fill-extrusion mapbox layers) will have a tooltip if the Threebox instance property [`tb.enableTooltips`](#enableTooltips) is set to true.

Here below is the simplest sample to load a 3D model:

```html
<!doctype html>
<head>
	<title>Simplest sample of 3D Model loading</title>
	<script src="../dist/threebox.js" type="text/javascript"></script>
	<script src="https://api.mapbox.com/mapbox-gl-js/v.1.11.1/mapbox-gl.js"></script>
	<link href="https://api.mapbox.com/mapbox-gl-js/v.1.11.1/mapbox-gl.css" rel="stylesheet" />
	<style>
		body, html {
			width: 100%;
			height: 100%;
			margin: 0;
			background: black;
		}
		#map {
			width: 100%;
			height: 100%;
		}
	</style>
</head>
<body>
	<div id='map' class='map'></div>
	<script>
		mapboxgl.accessToken = 'Paste here your mapbox access token key';

		var origin = [-122.47920912, 37.716351775];
		var destination, line;
		var soldier;

		var map = new mapboxgl.Map({
			container: 'map',
			style: 'mapbox://styles/mapbox/outdoors-v11',
			center: origin,
			zoom: 18,
			pitch: 60,
			bearing: 0
		});

		map.on('style.load', function () {
			map.addLayer({
				id: 'custom_layer',
				type: 'custom',
				renderingMode: '3d',
				onAdd: function (map, mbxContext) {

					window.tb = new Threebox(
						map,
						mbxContext,
						{ defaultLights: true }
					);

					var options = {
						obj: '/3D/soldier/soldier.glb',
						type: 'gltf',
						scale: 1,
						units: 'meters',
						rotation: { x: 90, y: 0, z: 0 } //default rotation
					}

					tb.loadObj(options, function (model) {
						soldier = model.setCoords(origin);
						tb.add(soldier);
					})

				},
				render: function (gl, matrix) {
					tb.update();
				}
			});
		})
	</script>
</body>
```

<br>

- - -

### Threebox Methods

Here is the full list of all the methods exposed by Threebox. 
In all the samples below, the instance of Threebox will be always referred as `tb`.

#### add 
```js
tb.add(obj [, layerId, sourceId])
```
method to add an object to Threebox scene. It will add it to `tb.world.children` array.

<br>


#### clear 
```js
async tb.clear([layerId, dispose])
```
This method removes any children from `tb.world`. If it receives a `layerId` this only affects to the objects in that layer.  
If it receives `true` as a param, it will also call internally `obj.dispose` to dispose all the resources reserved by those objects.

<br>

#### createSkyLayer 
```js
tb.createSkyLayer()
```
This internal method creates a new sky atmospheric layer, it's interally used by the property `tb.sky`.

<br>

#### createTerrainLayer 
```js
tb.createTerrainLayer()
```
This internal method creates a new terrain layer, it's interally used by the property `tb.terrain`.

<br>


#### defaultLights 
```js
tb.defaultLights()
```
This method creates the default illumination of the Threebox `scene`.  
By default, it creates a [`THREE.AmbientLight`](https://threejs.org/docs/#api/en/lights/AmbientLight) and assigned to [`tb.lights.ambientLight`]() two [`THREE.DirectionalLight`](https://threejs.org/docs/#api/en/lights/DirectionalLight).
These lights can be overriden manually adding custom lights to the Threebox `scene`.

<br>

#### dispose
```js
tb.dispose() : Promise (async)
```
If Threebox is being used as a part of a web application, it's recommended to dispose explicitely the instance of Threebox whenever 
its instance is not going to be used anymore or before navigating to another page that does not include Threebox, otherwise it's 
likely that you will face **memory leaks** issues not only due to Threebox, but also due to the internal use of *Mapbox GL* and *Three.js* instances needed to manage the objects.<br>
<br>
To dispose completely all the resources and memory Threebox can acumulate, including the internal resources from *Three.js* and *Mapbox GL*, it's needed to invoke the `dispose` method. <br>
<br>
This method will go through the scene created to dispose every object, geometry, material and texture in *Three.js*, then it will dispose all the resources from *Mapbox GL*, including the `WebGLRenderingContext` and itselft the Threebox instance.<br>
<br>
After calling to this method, Threebox and *Mapbox GL* map instances will be fully disposed so it's only recommended before navigating to other pages. 

<br>

#### findParent3DObject 
```js
tb.findParent3DObject(mesh) : Object3D
```
This method finds the parent Object3D in the Threebox scene by a mesh. This method is used in combination with `tb.queryRenderedFeatures` that returns an Array of objects, most of them Meshes where the [`THREE.Raycaster`](https://threejs.org/docs/#api/en/core/Raycaster) has interesected.

<br>


#### getFeatureCenter 
```js
tb.getFeatureCenter(feature, model, level): lnglat
```
Calculate the center of a feature geometry coordinates, including the altitude (in meters) for a given [*GeoJson*](https://geojson.org/) feature that can include or not a 3D model loaded and for a given level.
This method calls internally to `tb.getObjectHeightOnFloor` and can be used for both a Poligon feature for a Fill Extrusion or a Point feature for a 3D model.

<br>


#### getObjectHeightOnFloor 
```js
tb.getObjectHeightOnFloor(feature, obj, level) : number
```
Calculate the altitude (in meters) for a given [*GeoJson*](https://geojson.org/) feature that can include or not a 3D model loaded and for a given level.
This method can be used for both a Poligon feature for a Fill Extrusion or a Point feature for a 3D model.

<br>

#### getSunPosition 
```js
tb.getSunPosition(date, coords)
```
This method gets Sun light position (azimuth, altitude) based on `suncalc.js.` module which calculates the sun position for a given date, time, lng, lat combination. 

<br>

#### getSunSky 
```js
tb.getSunSky(date, sunPos)
```
This method gets Sun sky layer position `[azimuth, altitude]` based on `suncalc.js.` module which calculates the sun position for a given date, time, lng, lat combination. 
If `date` is provided, it will use that, otherwise it will use `new Date()`. If `sunPos` is provided, it will use that, otherwise it will calculate it based on map.getCenter() calling `tb.getSunPosition` method.

<br>


#### getSunTimes 
```js
tb.getSunTimes(date, coords)
```
This method gets Sun times based on `suncalc.js.` module which calculates the times for the different light phases (sunrise, sunset, etc..) from a given datetime, lng, lat and alt. This is used to change the map style based on day/night hour.
Returns an object with the following properties (each is a `Date` object):

| Property        | Description                                                              |
| --------------- | ------------------------------------------------------------------------ |
| `sunrise`       | sunrise (top edge of the sun appears on the horizon)                     |
| `sunriseEnd`    | sunrise ends (bottom edge of the sun touches the horizon)                |
| `goldenHourEnd` | morning golden hour (soft light, best time for photography) ends         |
| `solarNoon`     | solar noon (sun is in the highest position)                              |
| `goldenHour`    | evening golden hour starts                                               |
| `sunsetStart`   | sunset starts (bottom edge of the sun touches the horizon)               |
| `sunset`        | sunset (sun disappears below the horizon, evening civil twilight starts) |
| `dusk`          | dusk (evening nautical twilight starts)                                  |
| `nauticalDusk`  | nautical dusk (evening astronomical twilight starts)                     |
| `night`         | night starts (dark enough for astronomical observations)                 |
| `nadir`         | nadir (darkest moment of the night, sun is in the lowest position)       |
| `nightEnd`      | night ends (morning astronomical twilight starts)                        |
| `nauticalDawn`  | nautical dawn (morning nautical twilight starts)                         |
| `dawn`          | dawn (morning nautical twilight ends, morning civil twilight starts)     |
<br>


#### loadObj
```js
async tb.loadObj(options, callback(obj));
```

This async method loads a 3D model in different formats from its respective files. 
It automatically caches the first object for each resource url so the next instances are returned from `obj.duplicate`.
Note that unlike all the other object classes, this is asynchronous, and returns the object as an argument of the callback function. 
Internally, uses [`THREE.OBJLoader`](https://github.com/mrdoob/three.js/blob/dev/examples/jsm/loaders/OBJLoader.js), [`THREE.FBXLoader`](https://github.com/mrdoob/three.js/blob/dev/examples/jsm/loaders/FBXLoader.js), [`THREE.GLTFLoader`](https://github.com/mrdoob/three.js/blob/dev/examples/jsm/loaders/GLTFLoader.js) or [`THREE.ColladaLoader`](https://github.com/mrdoob/three.js/blob/dev/examples/jsm/loaders/ColladaLoader.js) respectively to fetch the  assets to each 3D format. [`THREE.FBXLoader`](https://github.com/mrdoob/three.js/blob/dev/examples/jsm/loaders/FBXLoader.js) also dependes on [Zlib](https://github.com/imaya/zlib.js) to open compressed files which this format is based on.

*[jscastro]* **IMPORTANT**: There are breaking changes in this release regarding the attributes below comparing to [@peterqliu original Threebox](https://github.com/peterqliu/threebox/). 

| option | required | default | type   | description                                                                                  |
|-----------|----------|---------|--------|----------|
| `type`  | yes       | "mtl"       | string (`"mtl"`, `"gltf"`, `"fbx"`, `"dae"`) | **BREAKING CHANGE**: Type is now required |
| `obj`  | yes       | NA       | string | **BREAKING CHANGE**: URL path to asset's .obj, .glb, .gltf, .fbx, .dae file. |
| `mtl`  | no       | NA       | string | URL path to assets .mtl files needed for OBJ models respectively|
| `bin`  | no       | NA       | string | URL path to assets .bin files needed for GLTF models respectively|
| `units`    | no       | scene      | string (`"scene"` or `"meters"`) | "meters" is recommended for precision. Units with which to interpret the object's vertices. If meters, Threebox will also rescale the object with changes in latitude, to appear to scale with objects and geography nearby.|
| `rotation`     | no       | 0   | number or {x, y, z}  | Rotation of the object along the three axes, to align it to desired orientation before future rotations. Note that future rotations apply atop this transformation, and do not overwrite it. `rotate` attribute must be provided in number or per axis ((i.e. for an object rotated 90 degrees over the x axis `rotation: {x: 90, y: 0, z: 0}`|
| `scale`     | no       | 1   | number or {x, y, z}  | Scale of the object along the three axes, to size it appropriately before future transformations. Note that future scaling applies atop this transformation, rather than overwriting it. `scale` attribute must be provided in number or per axis ((i.e. for an object transformed to 3 times higher than it's default size  `scale: {x: 1, y: 1, z: 3}`|
| `anchor`     | no       | `bottom-left`   | string ()  | This param will position the pivotal center of the 3D models to the coords it's positioned. This could have the following values `top`, `bottom`, `left`, `right`, `center`, `top-left`, `top-right`, `bottom-left`, `bottom-right`. Default value is `bottom-left`. `auto` value will do nothing, so the model will use the anchor defined in the model, whatever it is. |
| `adjustment`     | no       | 1   | {x, y, z}  | 3D models are often not centered in their axes so the object positions and rotates wrongly. `adjustment` param must be provided in units per axis (i.e. `adjustment: {x: 0.5, y: 0.5, z: 0}`), so the model will correct the center position of the object |
| `normalize`     | no       | true   | bool  | This param allows to normalize specular values from some 3D models |
| `feature`     | no       | 1   | [*GeoJson*](https://geojson.org/) feature  | [*GeoJson*](https://geojson.org/) feature instance. `properties` object of the *GeoJson* standard feature could be used to store relavant data to load and paint many different objects such as camera position, zoom, pitch or bearing, apart from the attributes already usually used by [*Mapbox GL* examples](https://docs.mapbox.com/mapbox-gl-js/examples/) such as `height`, `base_height`, `color`|
| `tooltip`     | no       | false   | bool  | This param allows to have or not a tooltip, by default is set with the value of `tb.enableTooltips` |
| `bbox`     | no       | false   | bool  | This param allows to have or not a bounding box, by default is set with the value of `tb.enableSelectingObjects`  |
| `raycasted`     | no       | true   | bool  | This param allows to hide an object from raycast individually |
| `clone`     | no       | true   | bool  | This param allows to load an object without cloning it by default, but it will reduce performance because the new object will consume extra memory as no textures will be cloned. Some objects could require full new instances when animations and textures don't work well with cloning, then `clone: false` will solve the problem. By default `clone` param is true. |
| `defaultAnimation`     | no       | 0   | number  | This allows to assign by param a default animation. Igneored if the object does not contain animations  |
| `callback`     | yes       | NA   | function  | A function to run after the object loads. The first argument will be the successfully loaded object, and this is normally used to finish the configuration of the model and add it to Threebox scene through `tb.add()` method. 


```js
map.addLayer({
	id: 'custom_layer',
	type: 'custom',
	renderingMode: '3d',
	onAdd: function (map, gl) {

		window.tb = new Threebox(
			map,
			gl,
			{ 
				defaultLights: true 
              enableSelectingFeatures: true, //omit or change this to false to disable fill-extrusion features selection
              enableSelectingObjects: true, //omit or change this to false to disable 3D objects selection
              enableDraggingObjects: true, //omit or change this to false to disable 3D objects drag & move once selected
              enableRotatingObjects: true, //omit or change this to false to disable 3D objects rotation once selected
              enableTooltips: true, //omit or change this to false to disable default tooltips on fill-extrusion and 3D models
			}
		);

		var options = {
			obj: '/3D/soldier/soldier.glb', //the model url, relative path to the page 
			type: 'gltf', //type enum, glb format is
			scale: 20, //20x the original size
			units: 'meters', //everything will be converted to meters in setCoords method				
			rotation: { x: 90, y: 0, z: 0 }, //default rotation
			adjustment: { x: 0, y: 0, z: 0 }, // model center is displaced
			feature: geoJsonFeature // a valid GeoJson feature
		}

		tb.loadObj(options, function (model) {
			//this wil position the soldier at the GeoJson feature coordinates 
			soldier = model.setCoords(feature.geometry.coordinates);
			tb.add(soldier);
		})

	},
	render: function (gl, matrix) {
		tb.update();
	}
});
```

After the callback is initiated, the object returned will have the following events already 
available to listen that enable the UI to behave and react to those. 
You can add these `addEventListener` lines below to `tb.loadObj`:

```js
	tb.loadObj(options, function (model) {

		soldier = model.setCoords(origin);

		soldier.addEventListener('SelectedChange', onSelectedChange, false);
		soldier.addEventListener('Wireframed', onWireframed, false);
		soldier.addEventListener('IsPlayingChanged', onIsPlayingChanged, false);
		soldier.addEventListener('ObjectDragged', onDraggedObject, false);
		soldier.addEventListener('ObjectMouseOver', onObjectMouseOver, false);
		soldier.addEventListener('ObjectMouseOut', onObjectMouseOut, false);

		tb.add(soldier);
	})
```

In this way you'll be able to manage in you UI through a function once these events are fired. 
See below an example for `onSelectedChange` to use the method [`map.flyTo(options[, eventData])`](https://docs.mapbox.com/mapbox-gl-js/api/map/#map#flyto) from *Mapbox GL*:

```js
// method to activate/deactivate a UI button.
// this example uses jQuery 
// this example requires a GeoJson feature included in the options of the tb.loadObj(options) 
function onSelectedChange(e) {
	let selected = e.detail.selected; //we get if the object is selected after the event
	$('#deleteButton')[0].disabled = !selected; //we find the delete button with jquery

	//if selected
	if (selected) {
		selectedObject = e.detail; //
		//we fly smoothly to the object selected
		map.flyTo({
			center: selectedObject.userData.feature.properties.camera,
			zoom: selectedObject.userData.feature.properties.zoom,
			pitch: selectedObject.userData.feature.properties.pitch,
			bearing: selectedObject.userData.feature.properties.bearing
		});
	}
	tb.update();
	map.repaint = true;
}
```
<br>

##### 3D Formats and MIME types 
Most of the popular 3D formats extensions (.glb, .gltf, .fbx, .dae, ...) are not standard [MIME types](https://www.iana.org/assignments/media-types/media-types.xhtml), so you will need to configure your web server engine to accept this extensions, otherwise you'll receive different HTTP errors downloading them. 
<br>
If you are using **IIS** server from an *ASP.Net* application, add the xml lines below in the `</system.webServer>` node of your *web.config* file:
```xml
<system.webServer>
	  ...
	  <staticContent>
		  <remove fileExtension=".mtl" />
		  <mimeMap fileExtension=".mtl" mimeType="model/mtl" />
		  <remove fileExtension=".obj" />
		  <mimeMap fileExtension=".obj" mimeType="model/obj" />
		  <remove fileExtension=".glb" />
		  <mimeMap fileExtension=".glb" mimeType="model/gltf-binary" />
		  <remove fileExtension=".gltf" />
		  <mimeMap fileExtension=".gltf" mimeType="model/gltf+json" />
		  <remove fileExtension=".fbx" />
		  <mimeMap fileExtension=".fbx" mimeType="application/octet-stream" />
		  <remove fileExtension=".dae" />
		  <mimeMap fileExtension=".dae" mimeType="application/vnd.oipf.dae.svg+xml" />
	  </staticContent>
</system.webServer>
```
<br/>

If you are using **ASP.net core** server, add the C# lines below in the `Configure` method of the `Startup` class:
```C#
public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
{
    ...

    // Set up custom content types - associating file extension to MIME type
    var provider = new FileExtensionContentTypeProvider();
    // Add new mappings
    provider.Mappings[".mtl"] = "model/mtl";
    provider.Mappings[".obj"] = "model/obj";
    provider.Mappings[".glb"] = "model/gltf-binary";
    provider.Mappings[".gltf"] = "model/gltf+json";
    provider.Mappings[".fbx"] = "application/octet-stream";
    provider.Mappings[".dae"] = "application/vnd.oipf.dae.svg+xml";

    app.UseStaticFiles(new StaticFileOptions 
    {
        ContentTypeProvider = provider
    });

    ...
}
```

<br/>

If you are using an **nginx** server, add the following lines to the *nginx.conf* file in the `http` object:
```
http {
	include /etc/nginx/mime.types;
	types {
		model/mtl mtl;
		model/obj obj;
		model/gltf+json gltf;
		model/gltf-binary glb;
		application/octet-stream fbx;
		application/vnd.oipf.dae.svg+xml dae;
	}
	...
}
```
If you are using an **Apache** server, add the following lines to the *mime.types* file:
```
model/mtl mtl
model/obj obj
model/gltf+json gltf
model/gltf-binary glb
application/octet-stream fbx
application/vnd.oipf.dae.svg+xml dae
```

<br>

#### memory 
```js
tb.memory() : Object
```
This will return the member `memory` from [`THREE.WebGLRenderer.info`](https://threejs.org/docs/#api/en/renderers/WebGLRenderer.info)

<br>

#### programs 
```js
tb.programs() : int
```
This will return the lenght of the `programs` member from [`THREE.WebGLRenderer.info`](https://threejs.org/docs/#api/en/renderers/WebGLRenderer.info)

<br>

#### projectToWorld 
```js
tb.projectToWorld(lnglat) : THREE.Vector3
```
Calculate the corresponding [`THREE.Vector3`](https://threejs.org/docs/#api/en/math/Vector3) for a given `lnglat`. It's inverse method is `tb.unprojectFromWorld`.

<br>

#### queryRenderedFeatures 
```js
tb.queryRenderedFeatures(point) : Array
```
This methods calculate objects intersecting the picking ray using [`THREE.Raycaster`](https://threejs.org/docs/#api/en/core/Raycaster) and returns an Array of the Threebox objects in the scene ordered by distance from closer to farther away.

Takes an input of `{x: number, y: number}` as an object with values representing screen coordinates (as returned by *Mapbox GL*  mouse events as `e.point`). 

<br>

#### realSunlight 
```js
tb.realSunlight([helper = true])
```
This method creates the an illumination that simulates Sun light for the Threebox `scene`. It creates a [`THREE.HemisphereLight`](https://threejs.org/docs/index.html#api/en/lights/HemisphereLight) and one [`THREE.DirectionalLight`](https://threejs.org/docs/#api/en/lights/DirectionalLight) 
that is positioned based on `suncalc.js.` module which calculates the sun position for a given date, time, lng, lat combination. It calls internally to `tb.setSunlight` with `map.getCenter` and `new Date()` as values.
These lights can be overriden manually adding custom lights to the Threebox `scene`.
If `helper` is true, then a helper is shown.
<br>

#### remove 
```js
tb.remove(obj)
```
Method to remove an object from Threebox scene and the `tb.world.children` array.

<br>

#### removeByName 
```js
tb.removeByName(name)
```
Method to remove an object from Threebox scene and the `tb.world.children` array, Searches through an object and its children, starting with the object itself, and removes the first with a matching name..

<br>

#### removeLayer 
```js
tb.removeLayer(layerId)
```
Method to remove a layer from Mapbox, including all 3D objects from Threebox scene and the `tb.world.children` array. 

<br>


#### setLayerHeigthProperty 
```js
tb.setLayerHeigthProperty(layerId, level) 
```
Method to set the height of all the objects in a level. 
This method only works if the objects have a [*GeoJson*](https://geojson.org/) feature, and a `level` attribute among its properties.

<br>

#### setLayerZoomRange 
```js
tb.setLayerZoomRange(layerId, minZoomLayer, maxZoomLayer)
```
Custom Layers don't work on minzoom and maxzoom attributes, as every layer is rendering the full scene, and if the layer is including labels they don't hide either on minzoom.  
This method sets the zoom range for any custom layer and manages the 3D objects and CSS2D labels toggle action in sync with layer visibility set through `tb.setLayoutProperty`.

<br>

#### setLayerZoomVisibility 
```js
tb.setLayerZoomVisibility(layerId)
```
This method sets or resets the layer visibility based on the current zoom. It's used by different methods to set the visibility of the layers.

<br>

#### setLayoutProperty 
```js
tb.setLayoutProperty(layerId, name, value)
```
This method replicates the behaviour of [`map.setLayoutProperty`](https://docs.mapbox.com/mapbox-gl-js/api/map/#map#setlayoutproperty) when custom layers are affected but it can used for any layer type. 

<br>

#### setObjectsScale 
```js
tb.setObjectsScale()
```
This method scales all the objects from `tb.world.children` that are `fixedZoom`. 

<br>

#### setStyle 
```js
tb.setStyle(styleId[, options])
```
This method replicates the behaviour of [`map.setStyle`](https://docs.mapbox.com/mapbox-gl-js/api/map/#map#setstyle) to remove the 3D objects from `tb.world`.
It's a direct passthrough to `map.setStyle` but it also calls internally `tb.clear(true)` to remove the children from `tb.world` and also to dispose all the resources reserved by those objects.

<br>

#### setSunlight 
```js
tb.setSunlight(newDate = new Date(), coords)
```
This method updates Sun light position based on `suncalc.js.` module which calculates the sun position for a given date, time, lng, lat combination. It calls internally to `tb.setSunlight` with `map.getCenter` and `new Date()` as values.

<br>

#### toggleLayer 
```js
tb.toggleLayer(layerId, visible) 
```
This method to toggles any layer visibility but it's specifically designed for custom layers. 
If you want to avoid differentiating between Mapbox layers (including custom layers) this method replaces the call to [`map.setLayoutProperty(layerId, 'visibility', visible)`](https://docs.mapbox.com/mapbox-gl-js/api/map/#map#setlayoutproperty)

<br>


#### update 
```js
tb.update()
```
With `tb.loadObj(options, callback(obj))` this is probably the most important method in Threebox 
as it's responsible of invoking the [`THREE.WebGLRenderer.render(scene, camera)`](https://threejs.org/docs/#api/en/renderers/WebGLRenderer.render)
 method.

<br>

#### updateLightHelper 
```js
tb.updateLightHelper()
```
This method updates the poition of `tb.lights.dirLightHelper`, it's needed if we want to see the helper properly render when the light moves.

<br>

#### updateSunGround 
```js
tb.updateSunGround(sunPos)
```
If `tb.realSunlight` is `true`, this method updates the light over the satellite style (if applied) according to the sun altitude.

<br>

#### updateSunSky 
```js
tb.updateSunSky(sunPos)
```
If `tb.sky` is `true`, this method updates the sky atmospheric layer with the received sun position.

<br>

#### unprojectFromWorld 
```js
tb.unprojectFromWorld(Vector3): lnglat
```
Calculate the corresponding `lnglat` for a given [`THREE.Vector3`](https://threejs.org/docs/#api/en/math/Vector3). It's inverse method is `tb.projectToWorld`.

<br>

#### versions 
```js
tb.version() : string
```
This will return the version of Threebox

<br>

- - -


### Threebox properties

In all the samples below, the instance of the Threebox will be always referred as `tb`.

<br>

#### altitudeStep

```js
tb.altitudeStep : Number
```
This get/set property receives and returns the size in meters of the step to use when an object is dragged vertically. By default this is set to 0.1 = 10cm.

<br>


#### defaultCursor

```js
tb.defaultCursor : string
```
This get/set property receives and returns the value of the default cursor for the map canvas container `this.getCanvasContainer().style.cursor`, initally set to `'default'`.

<br>

#### enableDraggingObjects

```js
tb.enableDraggingObjects : Boolean
```
This get/set property receives and returns the value to enable the option to drag 3D Objects vertical or horizontally created with Threebox.
This property requires `tb.enableSelectingFeature` is set to true.  
When this property is true, and an object is selected, holding the **[Shift] key + mouse click** the object will be moved on its x-y axes (horizontally).  
Holding the **[Ctrl] key + mouse click** the object will be moved on its z axis (vertically).
This dragging actions fire `ObjectDragged` event when the object is dropped, that can be listened as follows:
```js
obj.addEventListener('ObjectDragged', onDraggedObject, false)
```

This property doesn't affect to Mapbox `fill-extrusion` layers.  

<br>

#### enableRotatingObjects

```js
tb.enableRotatingObjects : Boolean
```
This get/set property receives and returns the value to enable the option to drag 3D Objects vertical or horizontally created with Threebox.
This property requires `tb.enableSelectingFeature` is set to true.  
When this property is true, and an object is selected, holding the **[Alt] key + mouse click** the object will be rotate pivoting over its anchor on z axis.  
Holding the **[Ctrl] key + mouse click** the object will be moved on its z axis (vertically).
This dragging actions fire `ObjectDragged` event when the object is dropped, that can be listened as follows:
```js
obj.addEventListener('ObjectDragged', onDraggedObject, false)
```

This property doesn't affect to Mapbox `fill-extrusion` layers.  

<br>

#### enableSelectingFeatures

```js
tb.enableSelectingFeatures : Boolean
```
This get/set property receives and returns the value to enable the option to select features from `fill-extrusion` layers.
This property doesn't affect to 3D objects.

This selection/unselection actions fire `SelectedFeatureChange` event when the object selected or unselected (explicitly or implicitly because of other feature  is selected instead), and can be listened as follows:
```js
obj.addEventListener('SelectedFeatureChange', onSelectedFeatureChange, false)
```


<br>

#### enableSelectingObjects

```js
tb.enableSelectingObjects : Boolean
```
This get/set property receives and returns the value to enable the option to select 3D Objects created with Threebox.  
This selection/unselection actions fire `SelectedChange` event when the object selected or unselected (explicitly or implicitly because of other object is selected instead), and can be listened as follows:
```js
obj.addEventListener('SelectedChange', onSelectedChange, false)
```

This property doesn't affect to Mapbox `fill-extrusion` layers.

<br>

#### enableTooltips

```js
tb.enableTooltips : Boolean
```
This get/set property receives and returns the value to enable the option to have tooltips (custom or by default) on objects. 
This property requires `tb.enableSelectingFeature` is set to true.  
When this property is true, and an object is overed or selected, its tooltip will be shown.

<br>

#### fov

```js
tb.fov : Number (degrees)
```
By default is `ThreeboxConstants.FOV_DEGREES`.  
This get/set property sets and returns the value of the Field of View (FOV) used in the Camera. 
This value is only valid when `tb.orthographic` is false which implicitly means the camera being used is a [`THREE.PerspectiveCamera`](https://threejs.org/docs/index.html#api/en/cameras/PerspectiveCamera).
When `tb.orthographic` is true, this value has no effect because the FOV for orthographic view is always 0.

**IMPORTANT**  
This property accepts values between 0 and 60 (that's the maximum range of FOV by Mapbox), but **below 2.5 degrees** will generate serious issues with polygons in fill-extrusions and 3D meshes, and **above 45 degrees** will also produce clipping and performance issues that can freeze your map.
Mapbox minimum value for the FOV cannot be `0`, so if it receives a `0` value, it will be converted to `0.01` by Mapbox `map.transform.fov` property to it's minimum value.

<br>
  

#### gridStep

```js
tb.gridStep : Number(integer)
```
This get/set property receives and returns the size in precision decimals of the step to use when an object is dragged horizontally reducing the number of decimals managed by Mapbox in its coords. 
By default the precision of this step is set to 6 decimals = 11.1 cm, setting this property to 7 the grid will be reduced to 1.1 cm.  
Mapbox minimum value for the FOV is `0.01`, so if it receives a `0` value, it will be converted to `0.01` by Mapbox `map.transform.fov` property to it's minimum value.

<br>

#### lights
```js
tb.lights : Object
```
This get\set property receives and returns the full set of lights applied to the scene.
`tb.lights.ambientLight` is initialized with an instance [`THREE.AmbientLight`](https://threejs.org/docs/#api/en/lights/AmbientLight) by [`tb.defaultLights()`](#defaultLights) method, but can be overriden manually.
`tb.lights.dirLight` could be initialized with an instance [`THREE.DirectionalLight`](https://threejs.org/docs/#api/en/lights/DirectionalLight) by [`tb.defaultLights()`](#defaultLights) or [`tb.setSunlight`](#setSunlight). It's not recommended to override this light is using [`realSunlight`](#realSunlight) property.
`tb.lights.dirLightBack` is initialized with an instance [`THREE.DirectionalLight`](https://threejs.org/docs/#api/en/lights/DirectionalLight) by [`tb.defaultLights()`](#defaultLights) method, but can be overriden manually.
`tb.lights.dirLightHelper` is initialized with an instance [`THREE.DirectionalLightHelper`](https://threejs.org/docs/#api/en/helpers/DirectionalLightHelper) by [`tb.setSunlight`](#setSunlight). I'll be visible only if [`realSunlightHelper`](#constructor) is tru in Threebox constructor.
`tb.lights.hemiLight` is initialized with an instance [`THREE.HemisphereLight`](https://threejs.org/docs/#api/en/lights/HemisphereLight) by [`tb.setSunlight`](#setSunlight).
`tb.lights.pointLight` is not initialized by default.

<br>

#### multiLayer

```js
tb.multiLayer : Boolean
```
By default is `false`.  
This get/set property receives and returns the value to enable the option to have multiple 3D layers, where a default layer will be created internally that will manage the `tb.update` calls
Despite this value can be changed in runtime, the value won't take effect unless there's a style change through `tb.setStyle`. So if you know your page could have multiple 3D layers, it's recommended to initialize it to true in Threebox constructor with the init param `multiLayer: true`. 

<br>

#### orthographic

```js
tb.orthographic : Boolean 
```
By default is `false`.  
This get/set property sets and returns the value of the Camera to be used. 
When `tb.orthographic` is `true`, the camera being used will be an instance of [`THREE.OrthographicCamera`](https://threejs.org/docs/index.html#api/en/cameras/OrthographicCamera).  
If `tb.orthographic` is `false`, the camera being used will be an instance of [`THREE.PerspectiveCamera`](https://threejs.org/docs/index.html#api/en/cameras/PerspectiveCamera).

**IMPORTANT**  
Pure orthographic view is not supported by Mapbox, as the minimum value for FOV is `0.01`, so if`tb.orthographic` is `true` will generate serious issues with polygons and depth calculations with fill-extrusions. 
Don't set this property to `true` is you are creating fill-extrusion layers. If need to have at the same time fill-extrusions and 3D Objects at the same time but want to keep an orthographic-like camera, the recommendation is to use `tb.orthographic = false` and `tb.fov = 2.5`.

<br>

#### rotationStep

```js
tb.rotationStep : Number
```
This get/set property receives and returns the size in degrees of the step to use when an object is dragged and rotated. By default this is set to 5.

<br>

#### sky

```js
tb.sky: Boolean
```
By default is `false`. This property is set by the init param `sky: true` in threebox constructor. 
This get/set property sets and returns the option to have a built-in atmospheric layer initially set with the time and the map center position.   
This layer is automatically updated if `realSunlight` is also true, but it can be updated separately through `tb.updateSunSky(tb.getSunSky())` method call. 
If this property is set to `false` after the atmospheric sky layer is created, it will remove the layer. 

<br>

#### terrain

```js
tb.terrain: Boolean
```
By default is `false`. This property is set by the init param `terrain: true` in threebox constructor. 
This get/set property sets and returns the option to have a built-in terrain layer. 
This layer is automatically updated if `realSunlight` is also true, adjusting it's light but it can be updated separately through `tb.updateSunGround(tb.getSunPosition())` method call. 
If this property is set to `false` after the terrain layer is created, it will remove the layer. 

<br>

## Objects

Threebox offers convenience functions to construct meshes of various *Three.js* meshes, as well as 3D models. 
Under the hood, they invoke a subclass of [THREE.Object3D](https://threejs.org/docs/#api/en/core/Object3D). 

Objects in Threebox fall under two broad varieties. *Static objects* don't move or change once they're placed, 
and used usually to display background or geographical features. They may have complex internal geometry, which 
are expressed primarily in lnglat coordinates. 

In contrast, *dynamic objects* can move around the map, positioned by a single lnglat point. 
Their internal geometries are produced mainly in local scene units, whether through external obj files, or these convenience 
methods below.

<br>

### Static objects

#### Line 

```js
tb.line(options);
```

Adds a line to the map, in full 3D space. Color renders independently of scene lighting. Internally, calls a [custom line shader](https://threejs.org/examples/?q=line#webgl_lines_fat).


| option | required | default | type   | purpose                                                                                  |
|-----------|----------|---------|--------|----------------------------------------------------------------------------------------------|
| `geometry`    | yes       | NA      | lineGeometry | Array of lnglat coordinates to draw the line |
| `color`     | no       | black   | color  | Color of line. Unlike other Threebox objects, this color will render on screen precisely as specified, regardless of scene lighting |
| `width`     | no       | 1   | number  | Line width. Unlike other Threebox objects, this width is in units of display pixels, rather than meters or scene units. |
| `opacity`     | no       | 1   | Number  | Line opacity |                                                                       


<br>

### Dynamic objects

#### Extrusion

```js
tb.extrusion(options);
```

Add a extruded shape to the map. Internally, calls `THREE.ExtrudeBufferGeometry`, and also to `Object3D(options)` to convert it in a dynamic object.

| option | required | default | type   | description                                                                                  |
|-----------|----------|---------|--------|-------|
| `coordinates`    | no       | [[[]]] or Vector2 array  | nested array | Nested array following the standard of a geoJson `feature.geometry.coordinates` with type polygon, or a `THREE.Vector2` array.  |
| `geometryOptions`    | no       | {} | Object | Object that contains the options following [ExtrudeGeometry](https://threejs.org/docs/index.html#api/en/geometries/ExtrudeGeometry) |
| `height`    | no       | 100      | Number | Length of the extruded shape.|
| `units`    | no       | `scene`      | string ("scene" or "meters") | Units with which to interpret the object's vertices. If meters, Threebox will also rescale the object with changes in latitude, to appear to scale with objects and geography nearby.|
| `scale`     | no       | 1   | number or {x, y, z}  | Scale of the object along the three axes, to size it appropriately before future transformations. Note that future scaling applies atop this transformation, rather than overwriting it. `scale` attribute must be provided in number or per axis ((i.e. for an object transformed to 3 times higher than it's default size  `scale: {x: 1, y: 1, z: 3}`|
| `rotation`     | no       | 0   | number or {x, y, z}  | Rotation of the object along the three axes, to align it to desired orientation before future rotations. Note that future rotations apply atop this transformation, and do not overwrite it. `rotate` attribute must be provided in number or per axis ((i.e. for an object rotated 90 degrees over the x axis `rotation: {x: 90, y: 0, z: 0}`|
| `materials`     | no       | `THREE.MeshPhongMaterial({ color: 0x660000, side: THREE.DoubleSide })`   | threeMaterial or threeMaterials array  | [THREE material](https://github.com/mrdoob/three.js/tree/master/src/materials) to use. Can be invoked with a text string, or a predefined material object via THREE itself.|   
| `anchor`     | no       | `bottom-left`   | string | This param will position the pivotal center of the 3D models to the coords it's positioned. This could have the following values `top`, `bottom`, `left`, `right`, `center`, `top-left`, `top-right`, `bottom-left`, `bottom-right`. Default value is `bottom-left` |
| `adjustment`     | no       | 1   | {x, y, z}  | For geometries the center is by default {0,0,0} position, this is the point to be used for location and for rotation. For perfect positioning and heigth from floor calculations this could be redefined in normalized units, `adjustment` param must be provided in units per axis (i.e. `adjustment: {x: -0.5, y: -0.5, z: 0}` , so the model will correct the center position of the object minus half of the x axis length and minus half of the y axis length ). If you position a cube created throuhg this method with by default center in a concrete `lnglat`on 0 height, half of the cube will be below the ground map level and the object will position at it's `{x,y}` center, so you can define `adjustment: { x: -0.5, y: -0.5, z: 0.5 }` to change the center to the bottom-left corner and that corner will be exactly in the `lnglat` position at the ground level. |
| `tooltip`     | no       | false   | bool  | This param allows to have or not a tooltip, by default is set with the value of `tb.enableTooltips` |
| `bbox`     | no       | false   | bool  | This param allows to have or not a bounding box, by default is set with the value of `tb.enableSelectingObjects`  |
| `raycasted`     | no       | true   | bool  | This param allows to hide an object from raycast individually |

<br>


#### Label

```js
tb.label(options);
```

Creates a new HTML Label object that can be positioned through `obj.setCoords(coords)` and then added to Threebox scene through `tb.add(obj)`.
Internally this method uses a `CSS2DObject` rendered by [`THREE.CSS2DRenderer`](https://threejs.org/docs/#examples/en/renderers/CSS2DRenderer) to create an instance of `THREE.CSS2DObject` that will be associated to the `obj.label` property.

| option | required | default | type   | description                                                                                  |
|-----------|----------|---------|--------|-------|
| `htmlElement`    | yes       | null      | htmlElement | HTMLElement that will be rendered as a `CSS2DObject` |
| `cssClass`    | no       | " label3D"      | string | CssClass that will be aggregated to manage the styles of the label object. |
| `alwaysVisible`  | no       | false       | number | Number of width and height segments. The higher the number, the smoother the sphere. |
| `topMargin`     | no       | -0.5   | int  | If `topMargin` is defined in number, it will be added to it's vertical position in units, where 1 is the object height. By default a label will be positioned in the vertical middle of the object (`topMargin: -0.5`)|
| `feature`     | no       | null   | [*GeoJson*](https://geojson.org/) feature  | [*GeoJson*](https://geojson.org/) feature to assign to the tooltip. It'll be used for dynamic positioning |                                                                            

<br>

#### Object3D

```js
tb.Object3D(options)
```

Add any geometry as [`THREE.Object3D`](https://threejs.org/docs/#api/en/core/Object3D) or [`THREE.Mesh`](https://threejs.org/docs/index.html#api/en/objects/Mesh) instantiated elsewhere in *Three.js*, to empower it with Threebox methods below. Unnecessary for 3d models instantiated with `tb.loadObj` above.

| option | required | default | type   | description                                                                                  |
|-----------|----------|---------|--------|------------|
| `obj`    | yes       | null      | [`THREE.Mesh`](https://threejs.org/docs/index.html#api/en/objects/Mesh) | Object to be enriched with this method adding new attributes. |
| `units`    | no       | `scene`      | string ("scene" or "meters") | Units with which to interpret the object's vertices. If meters, Threebox will also rescale the object with changes in latitude, to appear to scale with objects and geography nearby.|
| `anchor`     | no       | `bottom-left`   | string | This param will position the pivotal center of the 3D models to the coords it's positioned. This could have the following values `top`, `bottom`, `left`, `right`, `center`, `top-left`, `top-right`, `bottom-left`, `bottom-right`. Default value is `bottom-left` |
| `adjustment`     | no       | 1   | {x, y, z}  | For geometries the center is by default {0,0,0} position, this is the point to be used for location and for rotation. For perfect positioning and heigth from floor calculations this could be redefined in normalized units, `adjustment` param must be provided in units per axis (i.e. `adjustment: {x: -0.5, y: -0.5, z: 0}` , so the model will correct the center position of the object minus half of the x axis length and minus half of the y axis length ). If you position a cube created throuhg this method with by default center in a concrete `lnglat`on 0 height, half of the cube will be below the ground map level and the object will position at it's `{x,y}` center, so you can define `adjustment: { x: -0.5, y: -0.5, z: 0.5 }` to change the center to the bottom-left corner and that corner will be exactly in the `lnglat` position at the ground level. |
| `tooltip`     | no       | false   | bool  | This param allows to have or not a tooltip, by default is set with the value of `tb.enableTooltips` |
| `bbox`     | no       | false   | bool  | This param allows to have or not a bounding box, by default is set with the value of `tb.enableSelectingObjects`  |
| `raycasted`     | no       | true   | bool  | This param allows to hide an object from raycast individually |

This method enriches the Object in the same way is done at 3D Models through `tb.loadObj`.

<br>

#### Sphere

```js
tb.sphere(options);
```

Add a sphere to the map. Internally, calls `THREE.Mesh` with a `THREE.SphereGeometry`, and also to `Object3D(options)` to convert it in a dynamic object.

| option | required | default | type   | description                                                                                  |
|-----------|----------|---------|--------|-------|
| `radius`    | no       | 50      | number | Radius of sphere. |
| `units`    | no       | `scene`      | string ("scene" or "meters") | Units with which to interpret the object's vertices. If meters, Threebox will also rescale the object with changes in latitude, to appear to scale with objects and geography nearby.|
| `sides`  | no       | 8       | number | Number of width and height segments. The higher the number, the smoother the sphere. |
| `color`     | no       | black   | color  | Color of sphere.                                                                             
| `material`     | no       | MeshLambertMaterial   | threeMaterial  | [THREE material](https://github.com/mrdoob/three.js/tree/master/src/materials) to use. Can be invoked with a text string, or a predefined material object via THREE itself.|   
| `anchor`     | no       | `bottom-left`   | string | This param will position the pivotal center of the 3D models to the coords it's positioned. This could have the following values `top`, `bottom`, `left`, `right`, `center`, `top-left`, `top-right`, `bottom-left`, `bottom-right`. Default value is `bottom-left` |
| `adjustment`     | no       | 1   | {x, y, z}  | For geometries the center is by default {0,0,0} position, this is the point to be used for location and for rotation. For perfect positioning and heigth from floor calculations this could be redefined in normalized units, `adjustment` param must be provided in units per axis (i.e. `adjustment: {x: -0.5, y: -0.5, z: 0}` , so the model will correct the center position of the object minus half of the x axis length and minus half of the y axis length ). If you position a cube created throuhg this method with by default center in a concrete `lnglat`on 0 height, half of the cube will be below the ground map level and the object will position at it's `{x,y}` center, so you can define `adjustment: { x: -0.5, y: -0.5, z: 0.5 }` to change the center to the bottom-left corner and that corner will be exactly in the `lnglat` position at the ground level. |
| `tooltip`     | no       | false   | bool  | This param allows to have or not a tooltip, by default is set with the value of `tb.enableTooltips` |
| `bbox`     | no       | false   | bool  | This param allows to have or not a bounding box, by default is set with the value of `tb.enableSelectingObjects`  |
| `raycasted`     | no       | true   | bool  | This param allows to hide an object from raycast individually |

<br>

#### Tooltip

```js
tb.tooltip(options);
```

Creates a new browser-like Tooltip object that can be positioned through `obj.setCoords(coords)` and then added to Threebox scene through `tb.add(obj)`.
Internally this method uses a `CSS2DObject` rendered by [`THREE.CSS2DRenderer`](https://threejs.org/docs/#examples/en/renderers/CSS2DRenderer) to create an instance of `THREE.CSS2DObject` that will be associated to the `obj.tooltip` property.

| option | required | default | type   | description                                                                                  |
|-----------|----------|---------|--------|-------|
| `text`    | yes       | ""      | string | String that will be used to rendered as a `CSS2DObject` |
| `cssClass`    | no       | "toolTip text-xs"      | string | CssClass that will be aggregated to manage the styles of the label object. |
| `mapboxStyle`     | no       | false   | int  | If `mapboxStyle` is true, it applies the same styles the *Mapbox GL* popups. |                                                                            
| `topMargin`     | no       | 0   | int  | If `topMargin` is defined in number, it will be added to it's vertical position in units, where 1 is the object height. By default a label will be positioned on top of the object (`topMargin: 0`)|                                
| `feature`     | no       | null   | [*GeoJson*](https://geojson.org/) feature  | [*GeoJson*](https://geojson.org/) feature to assign to the tooltip. It'll be used for dynamic positioning |                                                                            

<br>

#### Tube

```js
tb.tube(options);
```

Extrude a tube along a specific lineGeometry, with an equilateral polygon as cross section. Internally uses a custom tube geometry generator, and also to `Object3D(options)` to convert it in a dynamic object.

| option | required | default | type   | description                                                                                  |
|-----------|----------|---------|--------|----------|
| `geometry`    | yes       | NA      | lineGeometry | Line coordinates forming the tube backbone |
| `radius`    | no       | 20      | number | Radius of the tube cross section, or half of tube width.|
| `sides`  | no       | 8       | number | Number of facets along the tube. The higher, the more closely the tube will approximate a smooth cylinder. |
| `material`     | no       | MeshLambertMaterial   | threeMaterial  | [THREE material](https://github.com/mrdoob/three.js/tree/master/src/materials) to use. Can be invoked with a text string, or a predefined material object via THREE itself.|   
| `color`     | no       | black   | color  | Tube color. Ignored if `material` is a predefined `THREE.Material` object.  |
| `opacity`     | no       | 1   | Number  | Tube opacity |                                                                                                                                                   
| `anchor`     | no       | `bottom-left`   | string | This param will position the pivotal center of the 3D models to the coords it's positioned. This could have the following values `top`, `bottom`, `left`, `right`, `center`, `top-left`, `top-right`, `bottom-left`, `bottom-right`. Default value is `bottom-left` |
| `adjustment`     | no       | 1   | {x, y, z}  | For geometries the center is by default {0,0,0} position, this is the point to be used for location and for rotation. For perfect positioning and heigth from floor calculations this could be redefined in normalized units, `adjustment` param must be provided in units per axis (i.e. `adjustment: {x: -0.5, y: -0.5, z: 0}` , so the model will correct the center position of the object minus half of the x axis length and minus half of the y axis length ). If you position a cube created throuhg this method with by default center in a concrete `lnglat`on 0 height, half of the cube will be below the ground map level and the object will position at it's `{x,y}` center, so you can define `adjustment: { x: -0.5, y: -0.5, z: 0.5 }` to change the center to the bottom-left corner and that corner will be exactly in the `lnglat` position at the ground level. |
| `tooltip`     | no       | false   | bool  | This param allows to have or not a tooltip, by default is set with the value of `tb.enableTooltips` |
| `bbox`     | no       | false   | bool  | This param allows to have or not a bounding box, by default is set with the value of `tb.enableSelectingObjects`  |
| `raycasted`     | no       | true   | bool  | This param allows to hide an object from raycast individually |

<br>

---


### Object methods

In all the samples below, the instance of the Threebox object will be always referred as `obj`

<br>

#### addCSS2D
```js
obj.addCSS2D(element, objName [, center = obj.anchor, height = 0])
```
This is a generic method that uses the DOM [HTMLElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement) received to paint it on screen in a relative position to the object that contains it. 
`objName` is needed to name the object and potentially to remove a previous one.
`center` defines the position where the label will rendered, by default the object anchor `obj.anchor`.
`height` defines this object position, where 0 is the object bottom and 1 is the object top, by default the bottom-center (0) of the object.

Internally this method uses a `CSS2DObject` rendered by [`THREE.CSS2DRenderer`](https://threejs.org/docs/#examples/en/renderers/CSS2DRenderer) to create an instance of `THREE.CSS2DObject` that is returned.

<br>

#### addHelp
```js
obj.addHelp(helpText [,objName = helpName, mapboxStyle = false, center = obj.anchor, height = 0])
```
This method creates a browser-like help tooltip instance that is accessible through `obj.help`. 
This help tooltip is only visible when an object is being dragged for a translation, rotation or altitude change. 
If `mapboxStyle` is true, it applies the same styles the *Mapbox GL* popups.
`center` defines the position where the label will rendered, by default the object anchor `obj.anchor`.
`height` defines this object position, where 0 is the object bottom and 1 is the object top, by default the bottom-center (0) of the object.

Internally this method uses a `CSS2DObject` rendered by [`THREE.CSS2DRenderer`](https://threejs.org/docs/#examples/en/renderers/CSS2DRenderer) to create an instance of `THREE.CSS2DObject` that will be associated to the `obj.help` property.
Internally this method calls `objects.prototype.drawTooltip` to create the needed HTML to wrap up the `HTMLElement` received by param. 
Internally this method calls `obj.addCSS2D`.

<br>

#### addLabel
```js
obj.addLabel(HTMLElement [, visible, center = obj.anchor, height = 0.5])

```
It uses the DOM [HTMLElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement) received to paint it on screen in a relative position to the object that contains it. 
If `visible` is true, the label will be always visible, otherwise by default its value is false and it's regular behavior is only to be shown on MouseOver.
`center` defines the position where the label will rendered, by default the object anchor `obj.anchor`.
`height` defines this object position, where 0 is the object bottom and 1 is the object top, by default the middle-center (0.5) of the object.

Internally this method uses a `CSS2DObject` rendered by [`THREE.CSS2DRenderer`](https://threejs.org/docs/#examples/en/renderers/CSS2DRenderer) to create an instance of `THREE.CSS2DObject` that will be associated to the `obj.label` property.
Internally this method calls `obj.drawLabelHTML` to create the needed HTML to wrap up the `HTMLElement` received by param. 

<br>

#### addTooltip
```js
obj.addTooltip(tooltipText [, mapboxStyle = false, center = obj.anchor, custom = true, height = 1])
```
This method creates a browser-like tooltip for the object using the tooltipText. 
If `mapboxStyle` is true, it applies the same styles the *Mapbox GL* popups.
`center` defines the position where the label will rendered, by default the object anchor `obj.anchor`.
`custom` is always true for explicitly added tooltips by the user, unless the tooltip is automatically generated by Threebox.
`height` defines this object position, where 0 is the object bottom and 1 is the object top, by default the top-center (1) of the object.

Internally this method uses a `CSS2DObject` rendered by [`THREE.CSS2DRenderer`](https://threejs.org/docs/#examples/en/renderers/CSS2DRenderer) to create an instance of `THREE.CSS2DObject` that will be associated to the `obj.tooptip` property.
Internally this method calls `obj.addHelp`.

<br>

#### copyAnchor
```js
obj.copyAnchor(anchor)
```
Copies the anchor properties, internally used in `obj.duplicate`. 

<br>

#### drawBoundingBox
```js
obj.drawBoundingBox
```
This method creates two bounding boxes using [`THREE.Box3Helper`](https://threejs.org/docs/#api/en/helpers/BoxHelper)
The first bounding box will be assigned to `obj.boundingBox` property and the second will be assigned to `obj.boundingBoxShadow`.  

<br>

#### drawLabelHTML
```js
obj.drawLabelHTML(HTMLElement [, visible = false, center = obj.anchor])

```
It uses the DOM [HTMLElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement) received to paint it on screen in a relative position to the object that contains it. 
If `visible` is true, the label will be always visible, otherwise by default its value is false and it's regular behavior is only to be shown on MouseOver.
`center` defines the object center of position and rotation that in 3D objects is defined through `options.adjustment` param. As the label is 
calculated based on the center of the object, this value will change the position of the object.
Its position is always relative to the object that contains it and rerendered whenever that label is visible.
Internally this method uses a `CSS2DObject` rendered by [`THREE.CSS2DRenderer`](https://threejs.org/docs/#examples/en/renderers/CSS2DRenderer) to create an instance of `THREE.CSS2DObject` that will be associated to the `obj.label` property.

<br/>

#### duplicate
```js
obj.duplicate()
```
Returns a clone of the object. Improves around a 95% the performance when handling many identical objects, by reusing materials and geometries.

<br>

#### removeCSS2D
```js
obj.removeCSS2D(objName)
```
Removes the instance of `CSS2DObject` by `objName` and dispose its resources.

<br>

#### removeHelp
```js
obj.removeHelp()
```
Removes the instance of `CSS2DObject` stored in `obj.help`.
Internally it calls `obj.removeCSS2D` method.

<br>

#### removeLabel
```js
obj.removeLabel()
```
Removes the instance of `CSS2DObject` stored in `obj.label`.
Internally it calls `obj.removeCSS2D` method.

<br>

#### removeTooltip
```js
obj.removeTooltip()
```
Removes the instance of `CSS2DObject` stored in `obj.tooltip`.
Internally it calls `obj.removeCSS2D` method.

<br>

#### set
```js
obj.set(options)
```
Broad method to update object's position, rotation, and scale in only one call. Internally it calls to `obj._setObject(options)` method. 
This method can also be used to animate an object if `options.duration` has a value.
Check out the Threebox Types section below for details. 

**options object on animations (`duration > 0`)**

| option | required | default | type   | description                                                                                  |
|-----------|----------|---------|--------|------------|
| `coords`    | no       | NA      | `lnglat` | Position to which to move the object |
| `rotation`    | no       | NA      | `rotationTransform` | Rotation(s) to set the object, in units of degrees |
| `scale`    | no       | NA      | `scaleTransform` | Scale(s) to set the object, where 1 is the default scale |
| `duration`    | no       | 1000      | number | Duration of the animation, in milliseconds to complete the values specified in the other properties `scale`, `rotation` and `coords`. If 0 or undefined it will apply the values to the object directly with no animation. |

**options object without animations (`duration == 0`)**

| option | required | default | type   | description                                                                                  |
|-----------|----------|---------|--------|------------|
| `position`    | no       | NA      | `lnglat` | Position to which to move the object |
| `rotation`    | no       | NA      | `rotationTransform` | Rotation(s) to set the object, in units of degrees |
| `scale`    | no       | NA      | `scaleTransform` | Scale(s) to set the object, where 1 is the default scale |
| `worldCoordinates` | no       | NA | `Vector3` | Duration of the animation, in milliseconds to complete the values specified in the other properties `scale`, `rotation` and `coords`. If 0 or undefined it will apply the values to the object directly with no animation. |
| `quaternion`    | no       | NA     | [`Vector3`, `radians`] | Rotation(s) to set to the axes received by the `Vector3` and in by the angle in radians |
| `translate`    | no       | NA      | `lnglat` | Increment to the coords position to translate the object. |
| `worldTranslate`  | no       | NA   | `Vector3` | Increment to the object world position to translate the object. |

<br>

#### setAnchor
```js
obj.setAnchor(anchor)
```
Sets the positional and pivotal anchor automatically from string param. Calculates dynamically the positional and pivotal anchor. 
`anchor` is a string value that could have the following values: `top`, `bottom`, `left`, `right`, `center`, `top-left`, `top-right`, `bottom-left`, `bottom-right`. 
Default value is `bottom-left` for precison on positioning 

<br>

#### setBoundingBoxShadowFloor
```js
obj.setBoundingBoxShadowFloor()
```
This method is called from `obj.setCoords` every time an object receives new coords to position `obj.boundingBoxShadow` at the height of the floor. 
So in this way if an object changes it's height the shadow box always projects over the floor and it's easier to visualize, position and rotate dragging it.

<br>

#### setCoords
```js
obj.setCoords(lnglat)
```
Positions the object at the defined `lnglat` coordinates, and resizes it appropriately if it was instantiated with `units: "meters"`. 
Can be called before adding object to the map.

<br>

#### setFixedZoom
```js
obj.setFixedZoom(scale)
```
Sets the scale used to convert the object based on `fixedZoom` value. The received param `scale` should be always equal to `map.transform.scale`.
This method is called from `obj.setScale` and other loading methods, so it's not needed to be called separately from the UI. 

<br>

#### setObjectScale
```js
obj.setObjectScale(scale)
```
Sets the scale used to convert the object considering object current `obj.unitsPerMeter` and depending the object is in units `scene` or `meters`.  
The received param `scale` should be always equal to `map.transform.scale`.  
This method calls internally `obj.setScale(scale)`, `obj.setBoundingBoxShadowFloor()`, `obj.setReceiveShadowFloor()` sequentially.

<br>

#### setRotation
```js
obj.setRotation(xyz)
```

Rotates the object over its defined center in the 3 axes, the value must be provided in degrees and could be a number (it will apply the rotation to the 3 axes) or as an {x, y, z} object. 
This rotation is applied on top of the rotation provided through loadObj(options).

<br>

#### setRotationAxis
```js
obj.setRotationAxis(xyz)
```

Rotates the object over one of its bottom corners on z axis, the value must be provided in degrees and could be a number (it will apply the rotation to the 3 axes) or as an {x, y, z} object. 
This rotation is applied on top of the rotation provided through loadObj(options).

<br>

#### setScale
```js
obj.setScale(scale)
```
Sets the scale used to convert the object considering object current `obj.unitsPerMeter` and depending the object is in units `scene` or `meters`.  
The received param `scale` should be always equal to `map.transform.scale`, if it's null, `obj.userData.mapScale` will be use instead.  
This method calls internally `obj.setFixedZoom`. 

<br>

#### setTranslate
```js
obj.setTranslate(lnglat)
```
Movesthe object from it's current position adding the `lnglat` coordinates recibed. Don't confuse this method with `obj.setCoords`
This method must be called after adding object to the map.

<br>

### Object properties

In all the samples below, the instance of the Threebox object will be always referred as `obj`.

<br>

#### boundingBox

```js
obj.boundingBox : THREE.Box3Helper
```
This get/set property receives and returns a [`THREE.Box3Helper`](https://threejs.org/docs/#api/en/helpers/BoxHelper) which contains the object in it's initial size. 
`boundingBox` represents is visible once the object is on MouseOver (yellow) or Selected (green).

By Threebox design `.boundingBox` is hidden for [`THREE.Raycaster`](https://threejs.org/docs/#api/en/core/Raycaster) even when it's visible for the camera.

*TODO: In next versions of Threebox, this object material will be configurable. In this versión still predefined in Objects.prototype*

<br>

#### boundingBoxShadow

```js
obj.boundingBoxShadow : THREE.Box3Helper
```
This get/set property receives and returns a [`THREE.Box3Helper`](https://threejs.org/docs/#api/en/helpers/BoxHelper) which contains the object in it's initial size but 0 height and projected to the floor of the map independently of its heigh position, so it acts as a shadow of the shape. 
`boundingBoxShadow` represents is visible once the object is on MouseOver or Selected in black color.

By Threebox design `.boundingBoxShadow` is hidden for [`THREE.Raycaster`](https://threejs.org/docs/#api/en/core/Raycaster) even when it's visible for the camera.

*TODO: In next versions of Threebox, this object material will be configurable. In this versión still predefined in Objects.prototype*

<br>

#### castShadow

```js
obj.castShadow : boolean
```
This get/set property receives and returns the value of the option of objects to cast a shadow.
It creates a plane with a `THREE.PlaneBufferGeometry` and a `THREE.ShadowMaterial()` centered on the object to project the shadow with the size of the longest dimension (x, y, z) size of the object and make it 10 times bigger to be able to hold the full shadow.

<br>

#### color

```js
obj.color : integer hex 
```
This get/set property receives and returns the value of the color from a hexadecimal value.
This method calls [`color.setHex`](https://threejs.org/docs/?q=color#api/en/math/Color.setHex) 

<br>

#### help

```js
obj.help : CSS2DObject
```
This get property returns a `CSS2DObject`[`THREE.CSS2DObject`](https://threejs.org/docs/index.html#examples/en/renderers/CSS2DRenderer) value that represents the help tooltip of a [`THREE.Object3D`](https://threejs.org/docs/#api/en/core/Object3D) created by `obj.addHelp` method, where the value of a rotation, translation or altitude change is shown while dragging. Despite this is accessible, this is an internal object only visible on drag&drop actions over an object.

<br>

#### hidden

```js
obj.hidden : boolean
```
This get/set property receives and returns the value of the hidden status of an object. This property overrides the value of `obj.visibility`.

<br>

#### fixedZoom

```js
obj.fixedZoom : Number
```
This get/set property receives and returns the value for the zoom below the one the object will have a fixed scale at any zoom level. Over the value, the object will rescale as always.
This property is very useful for models that need to be visible on very low zoom levels (i.e. an airplane describing a world route), but they also need to be visible when zoom is higher.  
It's important to know that `fixedZoom` will use the model in `scene` units, not in `meters`.

<br>

#### label

```js
obj.label : CSS2DObject
```
This get property returns a `CSS2DObject`[`THREE.CSS2DObject`](https://threejs.org/docs/index.html#examples/en/renderers/CSS2DRenderer) value that represents the label of a [`THREE.Object3D`](https://threejs.org/docs/#api/en/core/Object3D) created by `obj.addLabel` method. The label could be used as an element to show on mouse over or to be always visible. It's normally used to show attributes or status of a threebox object and can contain any HTMLElement.

<br>

#### modelHeight

```js
obj.modelHeight : Number
```
This get property returns the height of the object in meters. 

<br>

#### raycasted

```js
obj.raycasted : boolean
```
This get/set property receives and returns a boolean value to hide a [`THREE.Object3D`](https://threejs.org/docs/#api/en/core/Object3D.visible) from [`THREE.Raycaster`](https://threejs.org/docs/#api/en/core/Raycaster)  if false. 
By default all the objects are visible for raycaster. This value can be initialized by default through `tb.loadObj` or `tb.Object3D`.

<br>


#### receiveShadow

```js
obj.receiveShadow : boolean
```
This get/set property receives and returns the value of the option of objects to receive a shadow.

<br>

#### tooltip

```js
obj.tooltip : CSS2DObject
```
This get property returns a `CSS2DObject`[`THREE.CSS2DObject`](https://threejs.org/docs/index.html#examples/en/renderers/CSS2DRenderer) value that represents the tooltip of a [`THREE.Object3D`](https://threejs.org/docs/#api/en/core/Object3D) created by `obj.addTooltip` method. 
The tooltip by default shows the `uuid` value of a threebox object and it's only visible if `tb.enableTooltips` is true.

<br>

#### unitsPerMeter

```js
obj.unitsPerMeter : Number
```
This get property returns the conversion value of units per meter at the object current latitude. 

<br>

#### visibility

```js
obj.visibility : boolean
```
This get/set property receives and returns a boolean value to override the property `visible` of a  [`THREE.Object3D`](https://threejs.org/docs/#api/en/core/Object3D.visible), 
adding also the same visibility value for `obj.label` and `obj.tooltip`
This property is overriden by `obj.hidden`, so if `obj.hidden` is false, `obj.visibility` is ignored.
By Threebox design `.boundingBoxShadow` is hidden for [`THREE.Raycaster`](https://threejs.org/docs/#api/en/core/Raycaster) even when it's visible for the camera.


<br>

#### wireframe

```js
obj.wireframe : boolean
```
This get/set property receives and returns a boolean value to convert an [`THREE.Object3D`](https://threejs.org/docs/#api/en/core/Object3D.visible) in wireframes or texture it. 

By Threebox design whenever an object is converted to wireframes, it's also hidden for [`THREE.Raycaster`](https://threejs.org/docs/#api/en/core/Raycaster) even when it's visible for the camera.

<br>

---


### Object events

In all the samples below, the instance of the Threebox object will be always referred as `obj`

<br>

#### IsPlayingChanged

```js
obj.addEventListener('IsPlayingChanged', onIsPlayingChanged, false)
```

This event is fired once an object changes its animation playing status, it means it will be fired both when an object animation starts and stops to play.
The event can be listened at any time once the `tb.loadObj` callback method is being executed.
An instance of the object that changes is returned in `eventArgs.detail`. 

```js
map.addLayer({
	...
	tb.loadObj(options, function (model) {

		soldier = model.setCoords(origin);

		soldier.addEventListener('IsPlayingChanged', onIsPlayingChanged, false);

		tb.add(soldier);
	})

	...
});
...
function onIsPlayingChanged(eventArgs) {
	if (e.detail.isPlaying) {
		//do something in the UI such as changing a button state
	}
	else {
		//do something in the UI such as changing a button state
	}
}
```

<br>

#### ObjectChanged

```js
obj.addEventListener('ObjectChanged', onObjectChanged, false)
```

This event is fired when an object is changed by any method, including animations.  
The event can be listened at any time once the `tb.loadObj` callback method is being executed.
An instance of the object that changes is returned in `eventArgs.detail`, and the action made to the object that cound be one or more of the following:
- `position`: defined as lnglat + alt coords (i.e. `[-122.43471544901193, 37.73719686062993, 0]`), `undefined` if the change doesn't affect position.
- `rotation`: defined as radians in Vector3 format (i.e. `{x: 0, y: 0, z: -3.026900303641103}`), `undefined` if the change doesn't affect rotation.
- `scale`: defined as a Vector3 (i.e. `{x: 1, y: 1, z: 1}`), , `undefined` if the change doesn't affect scale.

```js
map.addLayer({
	...
	tb.loadObj(options, function (model) {
		model.setCoords(origin);
		model.addEventListener('ObjectChanged', onObjectChanged, false);
		tb.add(model);
	})

	...
});
...
function onObjectChanged(e) {
	let object = e.detail.object; // the object that has changed
	let action = e.detail.action; // the action that defines the change
	//do something in the UI such as changing a button state or updating the new position and rotation
}
```

<br>


#### ObjectDragged

```js
obj.addEventListener('ObjectDragged', onDraggedObject, false)
```

This event is fired when an object changes is dragged and dropped in a different position, and only once when `map.once('mouseup'` and  `map.once('mouseout'`. 
The event can be listened at any time once the `tb.loadObj` callback method is being executed.
An instance of the object that changes is returned in `eventArgs.detail`, and the action made during the dragging that cound be `"rotate"` if the object has been rotated on its center axis or `"translate"`/`"altitude"` if the object has been moved to other position . 

```js
map.addLayer({
	...
	tb.loadObj(options, function (model) {

		soldier = model.setCoords(origin);

		soldier.addEventListener('ObjectDragged', onDraggedObject, false);

		tb.add(soldier);
	})

	...
});
...
function onDraggedObject(e) {
	let draggedObject = e.detail.draggedObject; // the object dragged
	let draggedAction = e.detail.draggedAction; // the action during dragging

	//do something in the UI such as changing a button state or updating the new position and rotation
}
```

<br>


#### ObjectMouseOver

```js
obj.addEventListener('ObjectMouseOver', onObjectMouseOver, false)
```

This event is fired when an object is overed by the mouse pointer.  
The event can be listened at any time once the `tb.loadObj` callback method is being executed.
An instance of the object that changes is returned in `eventArgs.detail`. 

```js
map.addLayer({
	...
	tb.loadObj(options, function (model) {

		soldier = model.setCoords(origin);

		soldier.addEventListener('ObjectMouseOver', onObjectMouseOver, false);

		tb.add(soldier);
	})

	...
});
...
function onObjectMouseOver(e) {
	//do something in the UI such as adding help or showing this object attributes
}
```

<br>


#### ObjectMouseOut

```js
obj.addEventListener('ObjectMouseOut', onObjectMouseOut, false)
```

This event is fired when the mouse pointer leaves an object that has been overed.   
The event can be listened at any time once the `tb.loadObj` callback method is being executed.
An instance of the object that changes is returned in `eventArgs.detail`. 

```js
map.addLayer({
	...
	tb.loadObj(options, function (model) {

		soldier = model.setCoords(origin);

		soldier.addEventListener('ObjectMouseOut', onObjectMouseOut, false);

		tb.add(soldier);
	})

	...
});
...
function onObjectMouseOut(e) {
	//do something in the UI such as removing help
}
```

<br>

#### SelectedChange

```js
obj.addEventListener('SelectedChange', onSelectedChange, false)
```
This event is fired once an object changes its selection status, it means it will be fired both when an object is selected or unselected.
The event can be listened at any time once the `tb.loadObj` callback method is being executed.
An instance of the object that changes is returned in `eventArgs.detail`. 

```js
map.addLayer({
	...
	tb.loadObj(options, function (model) {

		soldier = model.setCoords(origin);

		soldier.addEventListener('SelectedChange', onSelectedChange, false);

		tb.add(soldier);
	})

	...
});
...
function onSelectedChange(e) {
	let selectedObject = e.detail; //we get the object selected/unselected
	let selectedValue = selectedObject.selected; //we get if the object is selected after the event
}
```

<br>

#### SelectedFeature

```js
map.on('SelectedFeature', onSelectedFeature)
```
This event is fired by Threebox usign the same pattern of mapbox the `feature-state` `select` and `hover` 
**TODO**
once an object changes its selection status, it means it will be fired both when an object is selected or unselected.
The event can be listened at any time once the `tb.loadObj` callback method is being executed.
An instance of the object that changes is returned in `eventArgs.detail`. 

```js
map.addLayer({
	'id': 'room-extrusion',
	'type': 'fill-extrusion',
	'source': 'floorplan',
	'paint': {
	// See the Mapbox Style Specification for details on data expressions.
	// https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions
 
	// Get the fill-extrusion-color from the source 'color' property.
	'fill-extrusion-color':
		[
			'case',
			['boolean', ['feature-state', 'select'], false],
			'#ffff00',
			['boolean', ['feature-state', 'hover'], false],
			'#0000ff',
			['get', 'color']
		],
 
	// Get fill-extrusion-height from the source 'height' property.
	'fill-extrusion-height': ['get', 'height'],
 
	// Get fill-extrusion-base from the source 'base_height' property.
	'fill-extrusion-base': ['get', 'base_height'],
 
	// Make extrusions slightly opaque for see through indoor walls.
	'fill-extrusion-opacity': 0.5
}
});
//selected extrusion feature event
map.on('SelectedFeature', onSelectedFeature);
...
function onSelectedFeature(e) {
	let selectedObject = e.detail; //we get the object selected/unselected
	let selectedValue = selectedObject.selected; //we get if the object is selected after the event
}
```

<br>

#### Wireframed

```js
obj.addEventListener('Wireframed', onWireframed, false)
```

This event is fired once an object is changes its wireframe status, it means it will be fired both when an object is wireframed or textured again.
The event can be listened at any time once the `tb.loadObj` callback method is being executed.
An instance of the object that changes is returned in `eventArgs.detail`. 

```js
map.addLayer({
	...
	tb.loadObj(options, function (model) {

		soldier = model.setCoords(origin);

		soldier.addEventListener('Wireframed', onWireframed, false);

		tb.add(soldier);
	})

	...
});
...
function onWireframed(e) {
	if (e.detail.wireframe) {
		//do something in the UI such as changing a button state
	}
	else {
		//do something in the UI such as changing a button state
	}
}
```

<br>

---


### Object animations

#### playDefault
```js
obj.playDefault(options)
```
Plays the default embedded animation of a loaded 3D model.

**options object**

| option | required | default | type   | description                                                                                  |
|-----------|----------|---------|--------|------------|
| `duration`    | no       | 1000      | number | Duration of the animation, in milliseconds |
| `speed`    | no       | 1      | number | This value changes the `obj.mixer.timeScale` of the animation being played where 1 is the default duration of the animation, < 1 will mathe the animation slower and > 1 will make the animation faster |

<br>

#### playAnimation
```js
obj.playAnimation(options)
```
Plays one of the embedded animations of a loaded 3D model. The animation index must be set in the attribute `options.animation`

**options object**

| option | required | default | type   | description                                                                                  |
|-----------|----------|---------|--------|------------|
| `animation`    | yes       | NA      | number | Index of the animation in the 3D model. If you need to check whats the index of the animation you can get the full array using `obj.animations`.|
| `duration`    | no       | 1000      | number | Duration of the animation, in milliseconds |
| `speed`    | no       | 1      | number | This value changes the `obj.mixer.timeScale` of the animation being played where 1 is the default duration of the animation, < 1 will mathe the animation slower and > 1 will make the animation faster |


<br>


#### followPath
```js
obj.followPath(options [, callback] )
```

Translate object along a specified path. Optional callback function to execute when animation finishes

| option | required | default | type   | description                                                                                  |
|-----------|----------|---------|--------|------------|
| `path`    | yes       | NA      | lineGeometry | Path for the object to follow |
| `duration`    | no       | 1000      | number | Duration to travel the path, in milliseconds |
| `trackHeading`    | no       | true      | boolean | Rotate the object so that it stays aligned with the direction of travel, throughout the animation |

<br>


#### stop
```js
obj.stop()
```

Stops all of object's current animations.

<br>


- - -

## Threebox types

#### pointGeometry 
`[longitude, latitude(, meters altitude)]`

An array of 2-3 numbers representing longitude, latitude, and optionally altitude (in meters). When altitude is omitted, it is assumed to be 0. When populating this from a [*GeoJson*](https://geojson.org/) Point, this array can be accessed at `point.geometry.coordinates`.  

While altitude is not standardized in the [*GeoJson*](https://geojson.org/) specification, Threebox will accept it as such to position objects along the z-axis.   

<br>

#### lineGeometry

`[pointGeometry, pointGeometry ... pointGeometry]`

An array of at least two lnglat's, forming a line. When populating this from a [*GeoJson*](https://geojson.org/) Linestring, this array can be accessed at `linestring.geometry.coordinates`. 

<br>

#### rotationTransform

`number` or `{x: number, y: number, z: number}`

Angle(s) in degrees to rotate object. Can be expressed as either an object or number. 

The object form takes three optional parameters along the three major axes: x is parallel to the equator, y parallel to longitudinal lines, and z perpendicular to the ground plane.

The number form rotates along the z axis, and equivalent to `{z: number}`.

<br>

#### scaleTransform

`number ` or `{x: number, y: number, z: number}`

Amount to scale the object, where 1 is the default size. Can be expressed as either an object or number.

The three axes are identical to those of `rotationTransform`. However, expressing as number form scales all three axes by that amount.

#### threeMaterial

`string` or instance of `THREE.Material()`

Denotes the material used for an object. This can usually be customized further with `color` and `opacity` parameters in the same 

Can be expressed as a string to the corresponding material type (e.g. `"MeshPhysicalMaterial"` for `THREE.MeshPhysicalMaterial()`), or a prebuilt THREE material directly.

<br>

- - -


## Performance considerations

- Use `obj.duplicate()` when adding many identical objects. If your object contains other objects not in the `obj.children` collection, then those objects need to be cloned too.
- This is a by default behavior when `tb.loadObj` is called. 
