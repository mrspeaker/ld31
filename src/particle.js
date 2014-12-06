(function () {

	"use strict";

	var Particle = {

		count: 0,

		init: function (x, y, angle) {

			// create the el
			this.x = x + (30 + (Math.random() * 30)) * Math.sin(angle);
			this.y = y + (30 + (Math.random() * 30)) * Math.cos(angle);
			this.angle = angle;
			this.life = 20 + ((Math.random() * 20) | 0);

			this.speed = 3;

			var el = this.el = document.createElement("div");
			el.className = "particle";
			el.innerHTML = String.fromCharCode(9731);

			var col = 360 * Math.random() | 0; //(0.6 + (Math.random() * 0.4)) | 0;
			//el.style.color = "rgb(" + col + "," + col + "," + col + ")";
			el.style.color = "hsl(" + col + ", 80%, 50%)";
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

			this.y += Math.cos(this.angle) * this.speed;
			this.x += Math.sin(this.angle) * this.speed;

			this.sync(1 - perc);

			return true;

		}

	};

	window.Particle = Particle;

}());
