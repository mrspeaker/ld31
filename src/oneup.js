(function () {

	"use strict";

	var OneUp = {

		count: 0,

		init: function (msg, x, y, dir, life) {

			// create the el
			this.x = x;
			this.y = y;
			this.msg = msg;
			this.dir = dir || -1;
			this.life = life || 50;

			var el = this.el = document.createElement("div");
			el.className = "oneup";
			el.innerHTML = msg;
			this.sync(1);

			return this;

		},

		sync: function (perc) {

			this.el.style.top = this.y + "px";
			this.el.style.left = this.x + "px";
			this.el.style.opacity = perc;


		},

		tick: function () {

			// move the el
			var perc = this.count++ / this.life;

			if (perc > 1) {
				return false;
			}

			this.y += this.dir;

			this.sync(1 - perc);

			return true;

		}

	};

	window.OneUp = OneUp;

}());
