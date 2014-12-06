(function () {

	"use strict;"

	var utils = {

		clone: function (obj) {

    		if (null == obj || "object" != typeof obj) return obj;
    		var copy = obj.constructor();
    		for (var attr in obj) {
        		if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    		}
    		return copy;
		}

	};

	window.utils = utils;

}());