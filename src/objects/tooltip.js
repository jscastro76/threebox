const utils = require("../utils/utils.js");
const Objects = require('./objects.js');
const CSS2D = require('./CSS2DRenderer.js');
var THREE = require("../three.js");

function Tooltip(obj, objects) {

	obj = utils._validate(obj, Objects.prototype._defaults.tooltip);

	if (obj.text) {

		let divToolTip = Objects.prototype.drawTooltip(obj.text, obj.mapboxStyle);

		let tooltip = new CSS2D.CSS2DObject(divToolTip);
		tooltip.visible = false;
		tooltip.name = "tooltip";
		var userScaleGroup = Objects.prototype._makeGroup(tooltip, obj);
		Objects.prototype._addMethods(userScaleGroup, false, objects);
		return userScaleGroup;
	}

}

module.exports = exports = Tooltip;