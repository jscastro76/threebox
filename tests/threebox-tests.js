window.test = require('tape');
// Threebox = require("../src/Threebox.js");
// THREE = require("three");

// window.runTests = function () {
//     // material(instance);
// }

function vector3Equals(t, input, expected, allowableError, epsilon) {
    // Check that two Vector3s are equal to each other, allowing for a certain percentage of error due to floating point math
    if (allowableError === undefined) allowableError = 0.0000001;
    if (epsilon === undefined) epsilon = 0.00000000000001;
    var dX, dY, dZ;
    dX = Math.abs(input.x - expected.x) / (expected.x === 0 ? 1 : expected.x);
    dY = Math.abs(input.y - expected.y) / (expected.y === 0 ? 1 : expected.y);
    dZ = Math.abs(input.z - expected.z) / (expected.z === 0 ? 1 : expected.z);

    if (dX < epsilon) dX = 0;
    if (dY < epsilon) dY = 0;
    if (dZ < epsilon) dZ = 0;

    if(dX > allowableError || dY > allowableError || dZ > allowableError) {
        t.fail("Vector3 Equivalence failed: (" +  input.x + ", " + input.y + ", " + input.z + ") expected: (" +  expected.x + ", " + expected.y + ", " + expected.z + ")");
        console.log(dY);
    }
    t.pass("ok Vector3 equivalence");
}


function precisionRound(number, precision) {
    var factor = Math.pow(10, precision);
    var tempNumber = number * factor;
    var roundedTempNumber = Math.round(tempNumber);
    return roundedTempNumber / factor;
};
