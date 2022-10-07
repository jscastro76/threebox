const SunCalc = require('../../utils/suncalc.js');

class BuildingShadows {
	constructor(options, threebox) {
		this.id = options.layerId;
		this.type = 'custom';
		this.renderingMode = '3d';
		this.opacity = 0.5;
		this.buildingsLayerId = options.buildingsLayerId;
		this.minAltitude = options.minAltitude || 0.10;
		this.tb = threebox;
	}
	onAdd(map, gl) {
		this.map = map;
		// find layer source
		const sourceName = this.map.getLayer(this.buildingsLayerId).source;
		this.source = (this.map.style.sourceCaches || this.map.style._otherSourceCaches)[sourceName];
		if (!this.source) {
			console.warn(`Can't find layer ${this.buildingsLayerId}'s source.`);
		}

		// vertex shader of fill-extrusion layer is different in mapbox v1 and v2.
		// https://github.com/mapbox/mapbox-gl-js/commit/cef95aa0241e748b396236f1269fbb8270f31565
		const vertexSource = this._getVertexSource();
		const fragmentSource = `
			void main() {
				gl_FragColor = vec4(0.0, 0.0, 0.0, 0.7);
			}
			`;
		const vertexShader = gl.createShader(gl.VERTEX_SHADER);
		gl.shaderSource(vertexShader, vertexSource);
		gl.compileShader(vertexShader);
		const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
		gl.shaderSource(fragmentShader, fragmentSource);
		gl.compileShader(fragmentShader);
		this.program = gl.createProgram();
		gl.attachShader(this.program, vertexShader);
		gl.attachShader(this.program, fragmentShader);
		gl.linkProgram(this.program);
		gl.validateProgram(this.program);
		this.uMatrix = gl.getUniformLocation(this.program, "u_matrix");
		this.uHeightFactor = gl.getUniformLocation(this.program, "u_height_factor");
		this.uAltitude = gl.getUniformLocation(this.program, "u_altitude");
		this.uAzimuth = gl.getUniformLocation(this.program, "u_azimuth");

		if (this.tb.mapboxVersion >= 2.0) {
			this.aPosNormal = gl.getAttribLocation(this.program, "a_pos_normal_ed");
		} else {
			this.aPos = gl.getAttribLocation(this.program, "a_pos");
			this.aNormal = gl.getAttribLocation(this.program, "a_normal_ed");
		}

		this.aBase = gl.getAttribLocation(this.program, "a_base");
		this.aHeight = gl.getAttribLocation(this.program, "a_height");
	}
	render(gl, matrix) {
		if (!this.source) return;

		gl.useProgram(this.program);
		const coords = this.source.getVisibleCoordinates().reverse();
		const buildingsLayer = this.map.getLayer(this.buildingsLayerId);
		const context = this.map.painter.context;
		const { lng, lat } = this.map.getCenter();
		const pos = this.tb.getSunPosition(this.tb.lightDateTime, [lng, lat]);
		gl.uniform1f(this.uAltitude, (pos.altitude > this.minAltitude ? pos.altitude : 0));
		gl.uniform1f(this.uAzimuth, pos.azimuth + 3 * Math.PI / 2);
		//this.opacity = Math.sin(Math.max(pos.altitude, 0)) * 0.6;
		gl.enable(gl.BLEND);
		//gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.DST_ALPHA, gl.SRC_ALPHA);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
		var ext = gl.getExtension('EXT_blend_minmax');
		//gl.blendEquationSeparate(gl.FUNC_SUBTRACT, ext.MIN_EXT);
		//gl.blendEquation(gl.FUNC_ADD);
		gl.disable(gl.DEPTH_TEST);
		for (const coord of coords) {
			const tile = this.source.getTile(coord);
			const bucket = tile.getBucket(buildingsLayer);
			if (!bucket) continue;
			const [heightBuffer, baseBuffer] = bucket.programConfigurations.programConfigurations[this.buildingsLayerId]._buffers;
			gl.uniformMatrix4fv(this.uMatrix, false, (coord.posMatrix || coord.projMatrix));
			gl.uniform1f(this.uHeightFactor, Math.pow(2, coord.overscaledZ) / tile.tileSize / 8);
			for (const segment of bucket.segments.get()) {
				const numPrevAttrib = context.currentNumAttributes || 0;
				const numNextAttrib = 2;
				for (let i = numNextAttrib; i < numPrevAttrib; i++) gl.disableVertexAttribArray(i);
				const vertexOffset = segment.vertexOffset || 0;
				gl.enableVertexAttribArray(this.aNormal);
				gl.enableVertexAttribArray(this.aHeight);
				gl.enableVertexAttribArray(this.aBase);
				bucket.layoutVertexBuffer.bind();
				if (this.tb.mapboxVersion >= 2.0) {
					gl.enableVertexAttribArray(this.aPosNormal);
					gl.vertexAttribPointer(this.aPosNormal, 4, gl.SHORT, false, 8, 8 * vertexOffset);
				} else {
					gl.enableVertexAttribArray(this.aPos);
					gl.vertexAttribPointer(this.aPos, 2, gl.SHORT, false, 12, 12 * vertexOffset);
					gl.vertexAttribPointer(this.aNormal, 4, gl.SHORT, false, 12, 4 + 12 * vertexOffset);
				}

				heightBuffer.bind();
				gl.vertexAttribPointer(this.aHeight, 1, gl.FLOAT, false, 4, 4 * vertexOffset);
				baseBuffer.bind();
				gl.vertexAttribPointer(this.aBase, 1, gl.FLOAT, false, 4, 4 * vertexOffset);
				bucket.indexBuffer.bind();
				context.currentNumAttributes = numNextAttrib;
				gl.drawElements(gl.TRIANGLES, segment.primitiveLength * 3, gl.UNSIGNED_SHORT, segment.primitiveOffset * 3 * 2);
			}
		}
	}

	_getVertexSource() {
		if (this.tb.mapboxVersion >= 2.0) {
			return `
				uniform mat4 u_matrix;
				uniform float u_height_factor;
				uniform float u_altitude;
				uniform float u_azimuth;
				attribute vec4 a_pos_normal_ed;
				attribute lowp vec2 a_base;
				attribute lowp vec2 a_height;
				void main() {
					float base = max(0.0, a_base.x);
					float height = max(0.0, a_height.x);

					vec3 pos_nx = floor(a_pos_normal_ed.xyz * 0.5);
					mediump vec3 top_up_ny = a_pos_normal_ed.xyz - 2.0 * pos_nx;
					float t = top_up_ny.x;
					vec4 pos = vec4(pos_nx.xy, t > 0.0 ? height : base, 1);

					float len = pos.z * u_height_factor / tan(u_altitude);
					pos.x += cos(u_azimuth) * len;
					pos.y += sin(u_azimuth) * len;
					pos.z = 0.0;
					gl_Position = u_matrix * pos;
				}
			`;
		} else {
			return `
				uniform mat4 u_matrix;
				uniform float u_height_factor;
				uniform float u_altitude;
				uniform float u_azimuth;
				attribute vec2 a_pos;
				attribute vec4 a_normal_ed;
				attribute lowp vec2 a_base;
				attribute lowp vec2 a_height;
				void main() {
					float base = max(0.0, a_base.x);
					float height = max(0.0, a_height.x);
					float t = mod(a_normal_ed.x, 2.0);
					vec4 pos = vec4(a_pos, t > 0.0 ? height : base, 1);
					float len = pos.z * u_height_factor / tan(u_altitude);
					pos.x += cos(u_azimuth) * len;
					pos.y += sin(u_azimuth) * len;
					pos.z = 0.0;
					gl_Position = u_matrix * pos;
				}
			`;
		}
	}
}


module.exports = exports = BuildingShadows;