// Type validator

function Validate(){

};

Validate.prototype = {

    Coords: function(input) {

        if (input.constructor !== Array) {
            console.error("Coords must be an array")
            return
        }

        if (input.length < 2) {
            console.error("Coords length must be at least 2")
            return
        }

        for (member of input) {
            if (member.constructor !== Number) {
                console.error("Coords values must be numbers")
                return
            }
        }

        if (Math.abs(input[1]) > 90) {
            console.error("Latitude must be between -90 and 90")
            return
        }

        return input
    },

    Line: function(input) {

        var scope = this;

        if (input.constructor !== Array) {
            console.error("Line must be an array")
            return
        }

        for (coord of input){
            if (!scope.Coords(coord)) {
                console.error("Each coordinate in a line must be a valid Coords type")
                return
            }

        }

        return input
    },

    Rotation: function(input) {

        if (input.constructor === Number) input = {z: input}

        else if (input.constructor === Object) {

            for (const key of Object.keys(input)){

                if (!['x', 'y', 'z'].includes(key)) {
                    console.error('Rotation parameters must be x, y, or z')
                    return
                }
                if (input[key].constructor !== Number) {
                    console.error('Individual rotation values must be numbers')
                    return
                }
            }
        }

        else {
            console.error('Rotation must be an object or a number')
            return
        }

        return input
    },

    Scale: function(input) {

        if (input.constructor === Number) {
            input = {x:input, y:input, z: input}
        }

        else if (input.constructor === Object) {

            for (const key of Object.keys(input)){

                if (!['x', 'y', 'z'].includes(key)) {
                    console.error('Scale parameters must be x, y, or z')
                    return
                }
                if (input[key].constructor !== Number) {
                    console.error('Individual scale values must be numbers')
                    return
                }
            }
        }

        else {
            console.error('Scale must be an object or a number')
            return
        }

        return input
    }

}


module.exports = exports = Validate;
