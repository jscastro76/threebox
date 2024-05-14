/**
 * @author jscastro / https://github.com/jscastro76
 */
const utils = require("../utils/utils.js");
const Objects = require("./objects.js");
const CSS2D = require("./CSS2DRenderer.js");

function Label(obj, objects) {
  obj = utils._validate(obj, Objects.prototype._defaults.label);

  let div = Objects.prototype.drawLabelHTML(obj.htmlElement, obj.cssClass);

  let label = new CSS2D.CSS2DObject(div);
  label.name = "label";
  label.visible = obj.alwaysVisible;
  label.alwaysVisible = obj.alwaysVisible;
  var userScaleGroup = Objects.prototype._makeGroup(label, obj);
  Objects.prototype._addMethods(userScaleGroup, false, objects);
  userScaleGroup.visibility = obj.alwaysVisible;

  return userScaleGroup;
}

module.exports = exports = Label;
