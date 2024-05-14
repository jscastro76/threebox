const THREE = require("../three.js");
const utils = require("../utils/utils.js");
const Objects = require('./objects.js');

function line(obj, objects){

	obj = utils._validate(obj, Objects.prototype._defaults.line);

	// Geometry
    var straightProject = utils.lnglatsToWorld(obj.geometry);
	var normalized = utils.normalizeVertices(straightProject);
    var flattenedArray = utils.flattenVectors(normalized.vertices);
	//console.log('line', normalized.vertices)

	var geometry = new THREE.LineGeometry();
	geometry.setPositions( flattenedArray );

	// Material
	let matLine = new THREE.LineMaterial( {
		color: obj.color,
		linewidth: obj.width, // in pixels
		dashed: false,
		opacity: obj.opacity
	} );
	
	matLine.resolution.set( window.innerWidth, window.innerHeight );
	matLine.isMaterial = true;
	matLine.transparent = true;
	matLine.depthWrite = false;

	// Mesh
	line = new THREE.Line2( geometry, matLine );
	line.position.copy(normalized.position)
	line.computeLineDistances();

	return line
}

module.exports = exports = line;

/**
 * custom line shader by WestLangley, sourced from https://github.com/mrdoob/three.js/tree/master/examples/js/lines
 *
 */

(function () {

	const _box = new THREE.Box3();

	const _vector = new THREE.Vector3();

	class LineSegmentsGeometry extends THREE.InstancedBufferGeometry {

		constructor() {

			super();
			this.type = 'LineSegmentsGeometry';
			const positions = [- 1, 2, 0, 1, 2, 0, - 1, 1, 0, 1, 1, 0, - 1, 0, 0, 1, 0, 0, - 1, - 1, 0, 1, - 1, 0];
			const uvs = [- 1, 2, 1, 2, - 1, 1, 1, 1, - 1, - 1, 1, - 1, - 1, - 2, 1, - 2];
			const index = [0, 2, 1, 2, 3, 1, 2, 4, 3, 4, 5, 3, 4, 6, 5, 6, 7, 5];
			this.setIndex(index);
			this.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
			this.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));

		}

		applyMatrix4(matrix) {

			const start = this.attributes.instanceStart;
			const end = this.attributes.instanceEnd;

			if (start !== undefined) {

				start.applyMatrix4(matrix);
				end.applyMatrix4(matrix);
				start.needsUpdate = true;

			}

			if (this.boundingBox !== null) {

				this.computeBoundingBox();

			}

			if (this.boundingSphere !== null) {

				this.computeBoundingSphere();

			}

			return this;

		}

		setPositions(array) {

			let lineSegments;

			if (array instanceof Float32Array) {

				lineSegments = array;

			} else if (Array.isArray(array)) {

				lineSegments = new Float32Array(array);

			}

			const instanceBuffer = new THREE.InstancedInterleavedBuffer(lineSegments, 6, 1); // xyz, xyz

			this.setAttribute('instanceStart', new THREE.InterleavedBufferAttribute(instanceBuffer, 3, 0)); // xyz

			this.setAttribute('instanceEnd', new THREE.InterleavedBufferAttribute(instanceBuffer, 3, 3)); // xyz
			//

			this.computeBoundingBox();
			this.computeBoundingSphere();
			return this;

		}

		setColors(array) {

			let colors;

			if (array instanceof Float32Array) {

				colors = array;

			} else if (Array.isArray(array)) {

				colors = new Float32Array(array);

			}

			const instanceColorBuffer = new THREE.InstancedInterleavedBuffer(colors, 6, 1); // rgb, rgb

			this.setAttribute('instanceColorStart', new THREE.InterleavedBufferAttribute(instanceColorBuffer, 3, 0)); // rgb

			this.setAttribute('instanceColorEnd', new THREE.InterleavedBufferAttribute(instanceColorBuffer, 3, 3)); // rgb

			return this;

		}

		fromWireframeGeometry(geometry) {

			this.setPositions(geometry.attributes.position.array);
			return this;

		}

		fromEdgesGeometry(geometry) {

			this.setPositions(geometry.attributes.position.array);
			return this;

		}

		fromMesh(mesh) {

			this.fromWireframeGeometry(new THREE.WireframeGeometry(mesh.geometry)); // set colors, maybe

			return this;

		}

		fromLineSegments(lineSegments) {

			const geometry = lineSegments.geometry;

			if (geometry.isGeometry) {

				console.error('THREE.LineSegmentsGeometry no longer supports Geometry. Use THREE.BufferGeometry instead.');
				return;

			} else if (geometry.isBufferGeometry) {

				this.setPositions(geometry.attributes.position.array); // assumes non-indexed

			} // set colors, maybe


			return this;

		}

		computeBoundingBox() {

			if (this.boundingBox === null) {

				this.boundingBox = new THREE.Box3();

			}

			const start = this.attributes.instanceStart;
			const end = this.attributes.instanceEnd;

			if (start !== undefined && end !== undefined) {

				this.boundingBox.setFromBufferAttribute(start);

				_box.setFromBufferAttribute(end);

				this.boundingBox.union(_box);

			}

		}

		computeBoundingSphere() {

			if (this.boundingSphere === null) {

				this.boundingSphere = new THREE.Sphere();

			}

			if (this.boundingBox === null) {

				this.computeBoundingBox();

			}

			const start = this.attributes.instanceStart;
			const end = this.attributes.instanceEnd;

			if (start !== undefined && end !== undefined) {

				const center = this.boundingSphere.center;
				this.boundingBox.getCenter(center);
				let maxRadiusSq = 0;

				for (let i = 0, il = start.count; i < il; i++) {

					_vector.fromBufferAttribute(start, i);

					maxRadiusSq = Math.max(maxRadiusSq, center.distanceToSquared(_vector));

					_vector.fromBufferAttribute(end, i);

					maxRadiusSq = Math.max(maxRadiusSq, center.distanceToSquared(_vector));

				}

				this.boundingSphere.radius = Math.sqrt(maxRadiusSq);

				if (isNaN(this.boundingSphere.radius)) {

					console.error('THREE.LineSegmentsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.', this);

				}

			}

		}

		toJSON() { // todo
		}

		applyMatrix(matrix) {

			console.warn('THREE.LineSegmentsGeometry: applyMatrix() has been renamed to applyMatrix4().');
			return this.applyMatrix4(matrix);

		}

	}

	LineSegmentsGeometry.prototype.isLineSegmentsGeometry = true;

	THREE.LineSegmentsGeometry = LineSegmentsGeometry;

})();

/**
 * @author WestLangley / http://github.com/WestLangley
 *
 */

(function () {

	class LineGeometry extends THREE.LineSegmentsGeometry {

		constructor() {

			super();
			this.type = 'LineGeometry';

		}

		setPositions(array) {

			// converts [ x1, y1, z1,  x2, y2, z2, ... ] to pairs format
			var length = array.length - 3;
			var points = new Float32Array(2 * length);

			for (var i = 0; i < length; i += 3) {

				points[2 * i] = array[i];
				points[2 * i + 1] = array[i + 1];
				points[2 * i + 2] = array[i + 2];
				points[2 * i + 3] = array[i + 3];
				points[2 * i + 4] = array[i + 4];
				points[2 * i + 5] = array[i + 5];

			}

			super.setPositions(points);
			return this;

		}

		setColors(array) {

			// converts [ r1, g1, b1,  r2, g2, b2, ... ] to pairs format
			var length = array.length - 3;
			var colors = new Float32Array(2 * length);

			for (var i = 0; i < length; i += 3) {

				colors[2 * i] = array[i];
				colors[2 * i + 1] = array[i + 1];
				colors[2 * i + 2] = array[i + 2];
				colors[2 * i + 3] = array[i + 3];
				colors[2 * i + 4] = array[i + 4];
				colors[2 * i + 5] = array[i + 5];

			}

			super.setColors(colors);
			return this;

		}

		fromLine(line) {

			var geometry = line.geometry;

			if (geometry.isGeometry) {

				console.error('THREE.LineGeometry no longer supports Geometry. Use THREE.BufferGeometry instead.');
				return;

			} else if (geometry.isBufferGeometry) {

				this.setPositions(geometry.attributes.position.array); // assumes non-indexed

			} // set colors, maybe


			return this;

		}

	}

	LineGeometry.prototype.isLineGeometry = true;

	THREE.LineGeometry = LineGeometry;

})();

/**
 * @author WestLangley / http://github.com/WestLangley
 *
 */

(function () {

	class WireframeGeometry2 extends THREE.LineSegmentsGeometry {

		constructor(geometry) {

			super();
			this.type = 'WireframeGeometry2';
			this.fromWireframeGeometry(new THREE.WireframeGeometry(geometry)); // set colors, maybe

		}

	}

	WireframeGeometry2.prototype.isWireframeGeometry2 = true;

	THREE.WireframeGeometry2 = WireframeGeometry2;

})();

/**
 * @author WestLangley / http://github.com/WestLangley
 *
 * parameters = {
 *  color: <hex>,
 *  linewidth: <float>,
 *  dashed: <boolean>,
 *  dashScale: <float>,
 *  dashSize: <float>,
 *  gapSize: <float>,
 *  resolution: <Vector2>, // to be set by renderer
 * }
 */

(function () {

	/**
 * parameters = {
 *  color: <hex>,
 *  linewidth: <float>,
 *  dashed: <boolean>,
 *  dashScale: <float>,
 *  dashSize: <float>,
 *  gapSize: <float>,
 *  resolution: <Vector2>, // to be set by renderer
 * }
 */
	THREE.UniformsLib.line = {
		worldUnits: {
			value: 1
		},
		linewidth: {
			value: 1
		},
		resolution: {
			value: new THREE.Vector2(1, 1)
		},
		dashScale: {
			value: 1
		},
		dashSize: {
			value: 1
		},
		gapSize: {
			value: 1
		} // todo FIX - maybe change to totalSize

	};
	THREE.ShaderLib['line'] = {
		uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.common, THREE.UniformsLib.fog, THREE.UniformsLib.line]),
		vertexShader:
			/* glsl */
			`
		#include <common>
		#include <color_pars_vertex>
		#include <fog_pars_vertex>
		#include <logdepthbuf_pars_vertex>
		#include <clipping_planes_pars_vertex>

		uniform float linewidth;
		uniform vec2 resolution;

		attribute vec3 instanceStart;
		attribute vec3 instanceEnd;

		attribute vec3 instanceColorStart;
		attribute vec3 instanceColorEnd;

		varying vec2 vUv;
		varying vec4 worldPos;
		varying vec3 worldStart;
		varying vec3 worldEnd;

		#ifdef USE_DASH

			uniform float dashScale;
			attribute float instanceDistanceStart;
			attribute float instanceDistanceEnd;
			varying float vLineDistance;

		#endif

		void trimSegment( const in vec4 start, inout vec4 end ) {

			// trim end segment so it terminates between the camera plane and the near plane

			// conservative estimate of the near plane
			float a = projectionMatrix[ 2 ][ 2 ]; // 3nd entry in 3th column
			float b = projectionMatrix[ 3 ][ 2 ]; // 3nd entry in 4th column
			float nearEstimate = - 0.5 * b / a;

			float alpha = ( nearEstimate - start.z ) / ( end.z - start.z );

			end.xyz = mix( start.xyz, end.xyz, alpha );

		}

		void main() {

			#ifdef USE_COLOR

				vColor.xyz = ( position.y < 0.5 ) ? instanceColorStart : instanceColorEnd;

			#endif

			#ifdef USE_DASH

				vLineDistance = ( position.y < 0.5 ) ? dashScale * instanceDistanceStart : dashScale * instanceDistanceEnd;

			#endif

			float aspect = resolution.x / resolution.y;

			vUv = uv;

			// camera space
			vec4 start = modelViewMatrix * vec4( instanceStart, 1.0 );
			vec4 end = modelViewMatrix * vec4( instanceEnd, 1.0 );

			worldStart = start.xyz;
			worldEnd = end.xyz;

			// special case for perspective projection, and segments that terminate either in, or behind, the camera plane
			// clearly the gpu firmware has a way of addressing this issue when projecting into ndc space
			// but we need to perform ndc-space calculations in the shader, so we must address this issue directly
			// perhaps there is a more elegant solution -- WestLangley

			bool perspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 ); // 4th entry in the 3rd column

			if ( perspective ) {

				if ( start.z < 0.0 && end.z >= 0.0 ) {

					trimSegment( start, end );

				} else if ( end.z < 0.0 && start.z >= 0.0 ) {

					trimSegment( end, start );

				}

			}

			// clip space
			vec4 clipStart = projectionMatrix * start;
			vec4 clipEnd = projectionMatrix * end;

			// ndc space
			vec3 ndcStart = clipStart.xyz / clipStart.w;
			vec3 ndcEnd = clipEnd.xyz / clipEnd.w;

			// direction
			vec2 dir = ndcEnd.xy - ndcStart.xy;

			// account for clip-space aspect ratio
			dir.x *= aspect;
			dir = normalize( dir );

			#ifdef WORLD_UNITS

				// get the offset direction as perpendicular to the view vector
				vec3 worldDir = normalize( end.xyz - start.xyz );
				vec3 offset;
				if ( position.y < 0.5 ) {

					offset = normalize( cross( start.xyz, worldDir ) );

				} else {

					offset = normalize( cross( end.xyz, worldDir ) );

				}

				// sign flip
				if ( position.x < 0.0 ) offset *= - 1.0;

				float forwardOffset = dot( worldDir, vec3( 0.0, 0.0, 1.0 ) );

				// don't extend the line if we're rendering dashes because we
				// won't be rendering the endcaps
				#ifndef USE_DASH

					// extend the line bounds to encompass  endcaps
					start.xyz += - worldDir * linewidth * 0.5;
					end.xyz += worldDir * linewidth * 0.5;

					// shift the position of the quad so it hugs the forward edge of the line
					offset.xy -= dir * forwardOffset;
					offset.z += 0.5;

				#endif

				// endcaps
				if ( position.y > 1.0 || position.y < 0.0 ) {

					offset.xy += dir * 2.0 * forwardOffset;

				}

				// adjust for linewidth
				offset *= linewidth * 0.5;

				// set the world position
				worldPos = ( position.y < 0.5 ) ? start : end;
				worldPos.xyz += offset;

				// project the worldpos
				vec4 clip = projectionMatrix * worldPos;

				// shift the depth of the projected points so the line
				// segements overlap neatly
				vec3 clipPose = ( position.y < 0.5 ) ? ndcStart : ndcEnd;
				clip.z = clipPose.z * clip.w;

			#else

				vec2 offset = vec2( dir.y, - dir.x );
				// undo aspect ratio adjustment
				dir.x /= aspect;
				offset.x /= aspect;

				// sign flip
				if ( position.x < 0.0 ) offset *= - 1.0;

				// endcaps
				if ( position.y < 0.0 ) {

					offset += - dir;

				} else if ( position.y > 1.0 ) {

					offset += dir;

				}

				// adjust for linewidth
				offset *= linewidth;

				// adjust for clip-space to screen-space conversion // maybe resolution should be based on viewport ...
				offset /= resolution.y;

				// select end
				vec4 clip = ( position.y < 0.5 ) ? clipStart : clipEnd;

				// back to clip space
				offset *= clip.w;

				clip.xy += offset;

			#endif

			gl_Position = clip;

			vec4 mvPosition = ( position.y < 0.5 ) ? start : end; // this is an approximation

			#include <logdepthbuf_vertex>
			#include <clipping_planes_vertex>
			#include <fog_vertex>

		}
		`,
		fragmentShader:
			/* glsl */
			`
		uniform vec3 diffuse;
		uniform float opacity;
		uniform float linewidth;

		#ifdef USE_DASH

			uniform float dashSize;
			uniform float gapSize;

		#endif

		varying float vLineDistance;
		varying vec4 worldPos;
		varying vec3 worldStart;
		varying vec3 worldEnd;

		#include <common>
		#include <color_pars_fragment>
		#include <fog_pars_fragment>
		#include <logdepthbuf_pars_fragment>
		#include <clipping_planes_pars_fragment>

		varying vec2 vUv;

		vec2 closestLineToLine(vec3 p1, vec3 p2, vec3 p3, vec3 p4) {

			float mua;
			float mub;

			vec3 p13 = p1 - p3;
			vec3 p43 = p4 - p3;

			vec3 p21 = p2 - p1;

			float d1343 = dot( p13, p43 );
			float d4321 = dot( p43, p21 );
			float d1321 = dot( p13, p21 );
			float d4343 = dot( p43, p43 );
			float d2121 = dot( p21, p21 );

			float denom = d2121 * d4343 - d4321 * d4321;

			float numer = d1343 * d4321 - d1321 * d4343;

			mua = numer / denom;
			mua = clamp( mua, 0.0, 1.0 );
			mub = ( d1343 + d4321 * ( mua ) ) / d4343;
			mub = clamp( mub, 0.0, 1.0 );

			return vec2( mua, mub );

		}

		void main() {

			#include <clipping_planes_fragment>

			#ifdef USE_DASH

				if ( vUv.y < - 1.0 || vUv.y > 1.0 ) discard; // discard endcaps

				if ( mod( vLineDistance, dashSize + gapSize ) > dashSize ) discard; // todo - FIX

			#endif

			float alpha = opacity;

			#ifdef WORLD_UNITS

				// Find the closest points on the view ray and the line segment
				vec3 rayEnd = normalize( worldPos.xyz ) * 1e5;
				vec3 lineDir = worldEnd - worldStart;
				vec2 params = closestLineToLine( worldStart, worldEnd, vec3( 0.0, 0.0, 0.0 ), rayEnd );

				vec3 p1 = worldStart + lineDir * params.x;
				vec3 p2 = rayEnd * params.y;
				vec3 delta = p1 - p2;
				float len = length( delta );
				float norm = len / linewidth;

				#ifndef USE_DASH

					#ifdef ALPHA_TO_COVERAGE

						float dnorm = fwidth( norm );
						alpha = 1.0 - smoothstep( 0.5 - dnorm, 0.5 + dnorm, norm );

					#else

						if ( norm > 0.5 ) {

							discard;

						}

					#endif

				#endif

			#else

				#ifdef ALPHA_TO_COVERAGE

					// artifacts appear on some hardware if a derivative is taken within a conditional
					float a = vUv.x;
					float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
					float len2 = a * a + b * b;
					float dlen = fwidth( len2 );

					if ( abs( vUv.y ) > 1.0 ) {

						alpha = 1.0 - smoothstep( 1.0 - dlen, 1.0 + dlen, len2 );

					}

				#else

					if ( abs( vUv.y ) > 1.0 ) {

						float a = vUv.x;
						float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
						float len2 = a * a + b * b;

						if ( len2 > 1.0 ) discard;

					}

				#endif

			#endif

			vec4 diffuseColor = vec4( diffuse, alpha );

			#include <logdepthbuf_fragment>
			#include <color_fragment>

			gl_FragColor = vec4( diffuseColor.rgb, alpha );

			#include <tonemapping_fragment>
			#include <encodings_fragment>
			#include <fog_fragment>
			#include <premultiplied_alpha_fragment>

		}
		`
	};

	class LineMaterial extends THREE.ShaderMaterial {

		constructor(parameters) {

			super({
				type: 'LineMaterial',
				uniforms: THREE.UniformsUtils.clone(THREE.ShaderLib['line'].uniforms),
				vertexShader: THREE.ShaderLib['line'].vertexShader,
				fragmentShader: THREE.ShaderLib['line'].fragmentShader,
				clipping: true // required for clipping support

			});
			Object.defineProperties(this, {
				color: {
					enumerable: true,
					get: function () {

						return this.uniforms.diffuse.value;

					},
					set: function (value) {

						this.uniforms.diffuse.value = value;

					}
				},
				worldUnits: {
					enumerable: true,
					get: function () {

						return 'WORLD_UNITS' in this.defines;

					},
					set: function (value) {

						if (value === true) {

							this.defines.WORLD_UNITS = '';

						} else {

							delete this.defines.WORLD_UNITS;

						}

					}
				},
				linewidth: {
					enumerable: true,
					get: function () {

						return this.uniforms.linewidth.value;

					},
					set: function (value) {

						this.uniforms.linewidth.value = value;

					}
				},
				dashed: {
					enumerable: true,
					get: function () {

						return Boolean('USE_DASH' in this.defines);

					},

					set(value) {

						if (Boolean(value) !== Boolean('USE_DASH' in this.defines)) {

							this.needsUpdate = true;

						}

						if (value === true) {

							this.defines.USE_DASH = '';

						} else {

							delete this.defines.USE_DASH;

						}

					}

				},
				dashScale: {
					enumerable: true,
					get: function () {

						return this.uniforms.dashScale.value;

					},
					set: function (value) {

						this.uniforms.dashScale.value = value;

					}
				},
				dashSize: {
					enumerable: true,
					get: function () {

						return this.uniforms.dashSize.value;

					},
					set: function (value) {

						this.uniforms.dashSize.value = value;

					}
				},
				dashOffset: {
					enumerable: true,
					get: function () {

						return this.uniforms.dashOffset.value;

					},
					set: function (value) {

						this.uniforms.dashOffset.value = value;

					}
				},
				gapSize: {
					enumerable: true,
					get: function () {

						return this.uniforms.gapSize.value;

					},
					set: function (value) {

						this.uniforms.gapSize.value = value;

					}
				},
				opacity: {
					enumerable: true,
					get: function () {

						return this.uniforms.opacity.value;

					},
					set: function (value) {

						this.uniforms.opacity.value = value;

					}
				},
				resolution: {
					enumerable: true,
					get: function () {

						return this.uniforms.resolution.value;

					},
					set: function (value) {

						this.uniforms.resolution.value.copy(value);

					}
				},
				alphaToCoverage: {
					enumerable: true,
					get: function () {

						return Boolean('ALPHA_TO_COVERAGE' in this.defines);

					},
					set: function (value) {

						if (Boolean(value) !== Boolean('ALPHA_TO_COVERAGE' in this.defines)) {

							this.needsUpdate = true;

						}

						if (value === true) {

							this.defines.ALPHA_TO_COVERAGE = '';
							this.extensions.derivatives = true;

						} else {

							delete this.defines.ALPHA_TO_COVERAGE;
							this.extensions.derivatives = false;

						}

					}
				}
			});
			this.setValues(parameters);

		}

	}

	LineMaterial.prototype.isLineMaterial = true;

	THREE.LineMaterial = LineMaterial;

})();

/**
 * @author WestLangley / http://github.com/WestLangley
 *
 */

(function () {

	const _start = new THREE.Vector3();

	const _end = new THREE.Vector3();

	const _start4 = new THREE.Vector4();

	const _end4 = new THREE.Vector4();

	const _ssOrigin = new THREE.Vector4();

	const _ssOrigin3 = new THREE.Vector3();

	const _mvMatrix = new THREE.Matrix4();

	const _line = new THREE.Line3();

	const _closestPoint = new THREE.Vector3();

	const _box = new THREE.Box3();

	const _sphere = new THREE.Sphere();

	const _clipToWorldVector = new THREE.Vector4();

	class LineSegments2 extends THREE.Mesh {

		constructor(geometry = new THREE.LineSegmentsGeometry(), material = new THREE.LineMaterial({
			color: Math.random() * 0xffffff
		})) {

			super(geometry, material);
			this.type = 'LineSegments2';

		} // for backwards-compatability, but could be a method of THREE.LineSegmentsGeometry...


		computeLineDistances() {

			const geometry = this.geometry;
			const instanceStart = geometry.attributes.instanceStart;
			const instanceEnd = geometry.attributes.instanceEnd;
			const lineDistances = new Float32Array(2 * instanceStart.count);

			for (let i = 0, j = 0, l = instanceStart.count; i < l; i++, j += 2) {

				_start.fromBufferAttribute(instanceStart, i);

				_end.fromBufferAttribute(instanceEnd, i);

				lineDistances[j] = j === 0 ? 0 : lineDistances[j - 1];
				lineDistances[j + 1] = lineDistances[j] + _start.distanceTo(_end);

			}

			const instanceDistanceBuffer = new THREE.InstancedInterleavedBuffer(lineDistances, 2, 1); // d0, d1

			geometry.setAttribute('instanceDistanceStart', new THREE.InterleavedBufferAttribute(instanceDistanceBuffer, 1, 0)); // d0

			geometry.setAttribute('instanceDistanceEnd', new THREE.InterleavedBufferAttribute(instanceDistanceBuffer, 1, 1)); // d1

			return this;

		}

		raycast(raycaster, intersects) {

			if (raycaster.camera === null) {

				console.error('LineSegments2: "Raycaster.camera" needs to be set in order to raycast against LineSegments2.');

			}

			const threshold = raycaster.params.Line2 !== undefined ? raycaster.params.Line2.threshold || 0 : 0;
			const ray = raycaster.ray;
			const camera = raycaster.camera;
			const projectionMatrix = camera.projectionMatrix;
			const matrixWorld = this.matrixWorld;
			const geometry = this.geometry;
			const material = this.material;
			const resolution = material.resolution;
			const lineWidth = material.linewidth + threshold;
			const instanceStart = geometry.attributes.instanceStart;
			const instanceEnd = geometry.attributes.instanceEnd; // camera forward is negative

			const near = - camera.near; // clip space is [ - 1, 1 ] so multiply by two to get the full
			// width in clip space

			const ssMaxWidth = 2.0 * Math.max(lineWidth / resolution.width, lineWidth / resolution.height); //
			// check if we intersect the sphere bounds

			if (geometry.boundingSphere === null) {

				geometry.computeBoundingSphere();

			}

			_sphere.copy(geometry.boundingSphere).applyMatrix4(matrixWorld);

			const distanceToSphere = Math.max(camera.near, _sphere.distanceToPoint(ray.origin)); // get the w component to scale the world space line width

			_clipToWorldVector.set(0, 0, - distanceToSphere, 1.0).applyMatrix4(camera.projectionMatrix);

			_clipToWorldVector.multiplyScalar(1.0 / _clipToWorldVector.w);

			_clipToWorldVector.applyMatrix4(camera.projectionMatrixInverse); // increase the sphere bounds by the worst case line screen space width


			const sphereMargin = Math.abs(ssMaxWidth / _clipToWorldVector.w) * 0.5;
			_sphere.radius += sphereMargin;

			if (raycaster.ray.intersectsSphere(_sphere) === false) {

				return;

			} //
			// check if we intersect the box bounds


			if (geometry.boundingBox === null) {

				geometry.computeBoundingBox();

			}

			_box.copy(geometry.boundingBox).applyMatrix4(matrixWorld);

			const distanceToBox = Math.max(camera.near, _box.distanceToPoint(ray.origin)); // get the w component to scale the world space line width

			_clipToWorldVector.set(0, 0, - distanceToBox, 1.0).applyMatrix4(camera.projectionMatrix);

			_clipToWorldVector.multiplyScalar(1.0 / _clipToWorldVector.w);

			_clipToWorldVector.applyMatrix4(camera.projectionMatrixInverse); // increase the sphere bounds by the worst case line screen space width


			const boxMargin = Math.abs(ssMaxWidth / _clipToWorldVector.w) * 0.5;
			_box.max.x += boxMargin;
			_box.max.y += boxMargin;
			_box.max.z += boxMargin;
			_box.min.x -= boxMargin;
			_box.min.y -= boxMargin;
			_box.min.z -= boxMargin;

			if (raycaster.ray.intersectsBox(_box) === false) {

				return;

			} //
			// pick a point 1 unit out along the ray to avoid the ray origin
			// sitting at the camera origin which will cause "w" to be 0 when
			// applying the projection matrix.


			ray.at(1, _ssOrigin); // ndc space [ - 1.0, 1.0 ]

			_ssOrigin.w = 1;

			_ssOrigin.applyMatrix4(camera.matrixWorldInverse);

			_ssOrigin.applyMatrix4(projectionMatrix);

			_ssOrigin.multiplyScalar(1 / _ssOrigin.w); // screen space


			_ssOrigin.x *= resolution.x / 2;
			_ssOrigin.y *= resolution.y / 2;
			_ssOrigin.z = 0;

			_ssOrigin3.copy(_ssOrigin);

			_mvMatrix.multiplyMatrices(camera.matrixWorldInverse, matrixWorld);

			for (let i = 0, l = instanceStart.count; i < l; i++) {

				_start4.fromBufferAttribute(instanceStart, i);

				_end4.fromBufferAttribute(instanceEnd, i);

				_start4.w = 1;
				_end4.w = 1; // camera space

				_start4.applyMatrix4(_mvMatrix);

				_end4.applyMatrix4(_mvMatrix); // skip the segment if it's entirely behind the camera


				var isBehindCameraNear = _start4.z > near && _end4.z > near;

				if (isBehindCameraNear) {

					continue;

				} // trim the segment if it extends behind camera near


				if (_start4.z > near) {

					const deltaDist = _start4.z - _end4.z;
					const t = (_start4.z - near) / deltaDist;

					_start4.lerp(_end4, t);

				} else if (_end4.z > near) {

					const deltaDist = _end4.z - _start4.z;
					const t = (_end4.z - near) / deltaDist;

					_end4.lerp(_start4, t);

				} // clip space


				_start4.applyMatrix4(projectionMatrix);

				_end4.applyMatrix4(projectionMatrix); // ndc space [ - 1.0, 1.0 ]


				_start4.multiplyScalar(1 / _start4.w);

				_end4.multiplyScalar(1 / _end4.w); // screen space


				_start4.x *= resolution.x / 2;
				_start4.y *= resolution.y / 2;
				_end4.x *= resolution.x / 2;
				_end4.y *= resolution.y / 2; // create 2d segment

				_line.start.copy(_start4);

				_line.start.z = 0;

				_line.end.copy(_end4);

				_line.end.z = 0; // get closest point on ray to segment

				const param = _line.closestPointToPointParameter(_ssOrigin3, true);

				_line.at(param, _closestPoint); // check if the intersection point is within clip space


				const zPos = THREE.MathUtils.lerp(_start4.z, _end4.z, param);
				const isInClipSpace = zPos >= - 1 && zPos <= 1;
				const isInside = _ssOrigin3.distanceTo(_closestPoint) < lineWidth * 0.5;

				if (isInClipSpace && isInside) {

					_line.start.fromBufferAttribute(instanceStart, i);

					_line.end.fromBufferAttribute(instanceEnd, i);

					_line.start.applyMatrix4(matrixWorld);

					_line.end.applyMatrix4(matrixWorld);

					const pointOnLine = new THREE.Vector3();
					const point = new THREE.Vector3();
					ray.distanceSqToSegment(_line.start, _line.end, point, pointOnLine);
					intersects.push({
						point: point,
						pointOnLine: pointOnLine,
						distance: ray.origin.distanceTo(point),
						object: this,
						face: null,
						faceIndex: i,
						uv: null,
						uv2: null
					});

				}

			}

		}

	}

	LineSegments2.prototype.LineSegments2 = true;

	THREE.LineSegments2 = LineSegments2;

})();

/**
 * @author WestLangley / http://github.com/WestLangley
 *
 */

(function () {

	class Line2 extends THREE.LineSegments2 {

		constructor(geometry = new THREE.LineGeometry(), material = new THREE.LineMaterial({
			color: Math.random() * 0xffffff
		})) {

			super(geometry, material);
			this.type = 'Line2';

		}

	}

	Line2.prototype.isLine2 = true;

	THREE.Line2 = Line2;

})();

/**
 * @author WestLangley / http://github.com/WestLangley
 *
 */

(function () {

	const _start = new THREE.Vector3();

	const _end = new THREE.Vector3();

	class Wireframe extends THREE.Mesh {

		constructor(geometry = new THREE.LineSegmentsGeometry(), material = new THREE.LineMaterial({
			color: Math.random() * 0xffffff
		})) {

			super(geometry, material);
			this.type = 'Wireframe';

		} // for backwards-compatability, but could be a method of THREE.LineSegmentsGeometry...


		computeLineDistances() {

			const geometry = this.geometry;
			const instanceStart = geometry.attributes.instanceStart;
			const instanceEnd = geometry.attributes.instanceEnd;
			const lineDistances = new Float32Array(2 * instanceStart.count);

			for (let i = 0, j = 0, l = instanceStart.count; i < l; i++, j += 2) {

				_start.fromBufferAttribute(instanceStart, i);

				_end.fromBufferAttribute(instanceEnd, i);

				lineDistances[j] = j === 0 ? 0 : lineDistances[j - 1];
				lineDistances[j + 1] = lineDistances[j] + _start.distanceTo(_end);

			}

			const instanceDistanceBuffer = new THREE.InstancedInterleavedBuffer(lineDistances, 2, 1); // d0, d1

			geometry.setAttribute('instanceDistanceStart', new THREE.InterleavedBufferAttribute(instanceDistanceBuffer, 1, 0)); // d0

			geometry.setAttribute('instanceDistanceEnd', new THREE.InterleavedBufferAttribute(instanceDistanceBuffer, 1, 1)); // d1

			return this;

		}

	}

	Wireframe.prototype.isWireframe = true;

	THREE.Wireframe = Wireframe;

})();
