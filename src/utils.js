(function () {

	"use strict;"

	var utils = {

		clone: function (obj) {

    		return JSON.parse(JSON.stringify(obj))
		}

	};

	window.utils = utils;

}());