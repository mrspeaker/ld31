(function () {

	"use strict";

	var main = {

		maxW: 1024,
		maxH: 576,

		round: 0,
		score: 1000,
		last: Date.now(),

		debug: false,

		diff: {
			xo: 1.06,
			yo: 1.04,
			count: 1.15
		},

		init: function () {

			this.updateHUD();

			var snowman = 9731,
				start = 9000,
				board = document.querySelector("#board");
			var self = this;

			board.addEventListener("click", function (e) {
				if (e.target.className !== "char") {
					self.shuffle();
				} else {
					// Kill
					board.removeChild(e.target);
				}
			});

			var w = 100,
				h = 100,
				round = 1,
				count = 2,
				self = this;

			(function run () {

				board.innerHTML = "";
				for (var i = 0; i < count; i++) {
					if (start + i === snowman) continue;
					self.add(
						start + i,
						(Math.random() * w | 0),
						(Math.random() * h | 0)
					);
				}

				var snowy = self.add(
					snowman,
					Math.random() * w | 0,
					Math.random() * h | 0);

				if (self.debug) {
					snowy.style.backgroundColor = "red";
				}

				snowy.addEventListener("mousedown", function win (e) {

					self.gets();
					e.preventDefault();
					snowy.removeEventListener("mousedown", win);
					count *= self.diff.count;
					if (w < self.maxW - 20) w *= self.diff.xo;
					if (h < self.maxH - 20) h *= self.diff.yo;
					self.w = w;
					self.h = h;
					self.count = count;
					run();

				}, false);

			}());

			this.run();

		},

		run: function () {

			this.tick();

			requestAnimationFrame(function () {

				main.run();

			});

		},

		add: function (charCode, x, y) {

			var s = document.createElement("span");
			s.innerHTML = String.fromCharCode(charCode);
			s.className = "char";
			s.style.zIndex = Math.random () * 50 | 0;
			s.style.top = y + "px";
			s.style.left = x + "px";

			board.appendChild(s);

			return s;

		},

		shuffle: function () {

			Array.prototype.slice.call(document.querySelectorAll(".char"))
				.forEach(function (el) {
					el.style.zIndex = Math.random () * 50 | 0;
				});

		},

		gets: function () {

			this.score += 1300;
			this.round++;
			this.updateHUD();

			if (this.round > 30 && this.diff.count > 1.05) {
				this.diff.count -= 0.008;
			}

		},

		tick: function () {

			var now = Date.now();

			if (now - this.last > 1000) {
				this.last = now;
				this.score -= 30;

				this.updateHUD();
			}

		},

		updateHUD: function () {
			document.querySelector("#score").innerHTML = this.score;
			document.querySelector("#round").innerHTML = this.round;
			document.querySelector("#stats").innerHTML = this.diff.count + "--" + (this.count|0) + ":" + (this.w | 0) + ":" + (this.h |0);
		}

	}

	window.main = main;

}());
