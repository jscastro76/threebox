/// <reference types="mapbox-gl" />

import mapboxgl from "mapbox-gl";
import { Mesh, Object3D, Vector3 } from "three/src/Three.js";

declare interface IThreeboxConfiguration {
  /** Whether to add some default lighting to the scene. If no lighting added, most objects in the scene will render as black */
  defaultLights?: boolean;

  /** It sets lights that simulate Sun position for the map center coords map.getCenter and user local datetime new Date(). This sunlight can be updated through tb.setSunlight method. It calls internally to suncalc module. */
  realSunlight?: boolean;

  /** It sets if a light helper will be shown when realSunlight is true. */
  realSunlightHelper?: boolean;

  /** Color of line. Unlike other Threebox objects, this color will render on screen precisely as specified, regardless of scene lighting */
  passiveRendering?: boolean;

  /** Enables the Mouseover and Selection of fill-extrusion features. This will fire the event SelectedFeatureChange */
  enableSelectingFeatures?: boolean;

  /** Enables the Mouseover and Selection of 3D objects. This will fire the event SelectedChange. This value will set the options.bbx value of the objects created. */
  enableSelectingObjects?: boolean;

  /** Enables to the option to Drag a 3D object. This will fire the event ObjectDragged where draggedAction = 'translate' or draggedAction = 'altitude' */
  enableDraggingObjects?: boolean;

  /** Enables to the option to Drag a 3D object. This will fire the event ObjectDragged where draggedAction = 'rotate' */
  enableRotatingObjects?: boolean;

  /** Enables the default tooltips on fill-extrusion features and 3D Objects */
  enableTooltips?: boolean;

  /** Enables the default help tooltips when an object is being moved, rotated or measured. */
  enableHelpTooltips?: boolean;

  /** Enables the option for multi layer pages where a default layer will be created internally that will manage the tb.update calls */
  multiLayer?: boolean;

  /** Enables the option to set a THREE.OrthographicCamera instead of a THREE.PerspectiveCamera which is the default in Mapbox */
  orthographic?: boolean;

  /** Enables to set the FOV of the default THREE.PerspectiveCamera. This value has no effect if orthographic: trues */
  fov?: number;

  /** It sets a built-in atmospheric layer initially set with the time and the map center position. This layer is automatically updated if realSunlight is also true, but it can be updated separately through tb.updateSunSky(tb.getSunSky()) method call. */
  sky?: boolean;

  /** It sets a built-in terrain layer initially set with the time and the map center position. This layer is automatically updated if realSunlight is also true, but it can be updated separately through tb.updateSunSky(tb.getSunSky()) method call. */
  terrain?: boolean;
}

declare interface IObjectAddOptions {
  layerId: number;
  sourceId: number;
}

declare type AzimuthAltitude = [number, number];

declare class Object {}

declare interface RequiredObjectOption {
  type: "mtl" | "gltf" | "fbx" | "dae";
  obj: string;
}

declare interface OptionalObjectOption extends RequiredObjectOption {
  mtl: string;
  bin: string;
  units: "scene" | "meters";
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  anchor:
    | "top"
    | "bottom"
    | "left"
    | "right"
    | "center"
    | " top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right";
  adjustment: { x: number; y: number; z: number };
  normalize: boolean;
  feature: mapboxgl.GeoJSONSourceRaw;
  tooltip: boolean;
  bbox: boolean;
  raycasted: boolean;
  clone: boolean;
  defaultAnimation: number;
  callback: (model: Object) => void;
}

declare class Threebox {
  constructor(map: mapboxgl.Map, glContext: WebGLRenderingContext);
  constructor(
    map: mapboxgl.Map,
    glContext: WebGLRenderingContext,
    options: Partial<IThreeboxConfiguration>
  );
  add(obj: Object, layerId: number, sourceId: number): void;
  add(obj: Object): void;

  clear(): Promise<void>;
  clear(layerId: number, sourceId: number): Promise<void>;

  createSky(): void;
  createTerrainLayer(): void;
  defaultLights(): void;
  dispose(): Promise<void>;
  findParent3DObject(mesh: Mesh): Object3D;
  getFeatureCenter(feature, model, level): mapboxgl.LngLat;
  getObjectHeightOnFloor(feature, obj, level): number;
  // This method gets Sun light position (azimuth, altitude) base
  getSunPosition(date: Date, coords: mapboxgl.LngLat): AzimuthAltitude;
  getSunSky(date: Date, sunPos: mapboxgl.LngLat): AzimuthAltitude;
  getSunTimes(date: Date, coords: mapboxgl.LngLat): any;
  loadObj(
    options: RequiredObjectOption | Partial<OptionalObjectOption>,
    callBack: (model: Object) => void
  ): Promise<void>;
  memory(): any;
  programs(): number;
  projectToWorld(lnglat: mapboxgl.LngLat): Vector3;
  queryRenderedFeatures(point: any): [];
  realSunlight(helper: boolean): void;
  realSunlight(): void;
  remove(obj: Object): void;
  removeByName(name: string): void;
  removeLayer(layerId: number): void;
  setLayerHeigthProperty(layerId: number, level: number): void;
  setLayerZoomRange(
    layerId: number,
    minZoomLayer: number,
    maxZoomLayer: number
  ): void;
  setLayerZoomVisibility(layerId: number): void;
  setLayoutProperty(layerId: number, name: string, value: any): void;
  setObjectsScale(): void;
  setStyle(...any: any): void;

  setSunlight(newDate: Date, coords: mapboxgl.LngLat): void;
  toggleLayer(layerId: number, visible: boolean): void;
  update(): void;
  updateLightHelper(): void;
  updateSunGround(sunPos: mapboxgl.LngLat): void;
  updateSunSky(sunPos: mapboxgl.LngLat): void;
  unprojectFromWorld(vector: Vector3): mapboxgl.LngLat;
  version: string;
}
