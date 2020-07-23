const utils = require("../utils/Utils.js");
const Objects = require('./objects.js');
const CSS2D = require('./CSS2DRenderer.js');

function Tooltip(obj) {

	obj = utils._validate(obj, Objects.prototype._defaults.tooltip);

	if (obj.text) {

		let divToolTip = Objects.prototype.drawTooltip(obj.text, obj.mapboxStyle);

		let tooltip = new CSS2D.CSS2DObject(divToolTip);
		tooltip.visible = false;
		var userScaleGroup = Objects.prototype._makeGroup(tooltip, obj);
		Objects.prototype._addMethods(userScaleGroup);
		userScaleGroup.tooltip = tooltip;

		return userScaleGroup;
	}

}

module.exports = exports = Tooltip;
