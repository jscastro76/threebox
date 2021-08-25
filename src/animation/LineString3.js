const Vector3 = require('./Vector3.js');
const Curve = require('./Curve.js');

class LineString3 extends Curve {

	constructor(points, widths) {
		super();

		this.type = 'LineString3';
		this.points = points;
		this.widths = closed;

		let cumulativeDistance = 0;
		this.cumulativeDistances = this.points.map((point, i) => {
			if (i === 0) {
				return 0;
			}

			cumulativeDistance += point.distanceTo(points[i - 1]);
			return cumulativeDistance;
		});
	}

	getPoint( t, optionalTarget = new Vector3() ) {
		const point = optionalTarget;

		const dist = t * this.cumulativeDistances[this.cumulativeDistances.length - 1];

		let i = 1;
		while(this.cumulativeDistances[i] < dist) {
			i++
		}

		const localDist = dist - this.cumulativeDistances[i - 1];
		const newT = localDist / (this.cumulativeDistances[i] - this.cumulativeDistances[i - 1])

		if(newT > 1 || newT < 0) {
			console.warn("Bad t: " + newT);
		}

		point.lerpVectors(this.points[i - 1], this.points[i], newT);

		return point;
	}

	copy( source ) {

		super.copy( source );

		this.points = [];

		for ( let i = 0, l = source.points.length; i < l; i ++ ) {

			const point = source.points[ i ];

			this.points.push( point.clone() );

		}

		this.closed = source.closed;
		this.curveType = source.curveType;
		this.tension = source.tension;

		return this;

	}

	toJSON() {

		const data = super.toJSON();

		data.points = [];

		for ( let i = 0, l = this.points.length; i < l; i ++ ) {
			const point = this.points[ i ];
			data.points.push( point.toArray() );
		}

		data.closed = this.closed;
		data.curveType = this.curveType;
		data.tension = this.tension;
		data.widths = this.widths.slice();

		return data;

	}

	fromJSON( json ) {

		super.fromJSON( json );

		this.points = [];

		for ( let i = 0, l = json.points.length; i < l; i ++ ) {

			const point = json.points[ i ];
			this.points.push( new Vector3().fromArray( point ) );

		}

		this.closed = json.closed;
		this.curveType = json.curveType;
		this.tension = json.tension;

		return this;

	}

}

LineString3.prototype.isLineString3 = true;

module.exports = exports = LineString3;
