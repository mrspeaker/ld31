(function () {

	"use strict";

	var main = {

		maxW: 1024,
		maxH: 576,

		round: 0,
		score: 1000,
		last: Date.now(),

		debug: false,

		data: {
			scores: {
				removeOne: 5,
				shuffle: -1001,
				snowman: 3100,
				timeSubtract: -30
			},
			xo: 1.06,
			yo: 1.04,
			count: 1.15
		},

		fx: null,

		numChars: 0,

		init: function () {

			this.updateHUD();

			this.fx = [];

			var snowman = 9731,
				start = 9000,
				board = document.querySelector("#board");
			var self = this;

			this.board = board;
			this.boardPos = {
				x: board.offsetLeft,
				y: board.offsetTop
			}
			this.fxDom = document.querySelector("#fx");

			board.addEventListener("click", function (e) {
				if (e.target.className !== "char") {
					self.shuffle(e.pageX, e.pageY);
				} else {
					self.killChar(e.target);
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

				var snowy = self.snowman = self.add(
					snowman,
					Math.random() * w | 0,
					Math.random() * h | 0);

				if (self.debug) {
					snowy.style.backgroundColor = "red";
				}

				snowy.addEventListener("mousedown", function win (e) {

					self.gets(e.pageX, e.pageY);
					e.preventDefault();
					snowy.removeEventListener("mousedown", win);
					count *= self.data.count;
					if (w < self.maxW - 20) w *= self.data.xo;
					if (h < self.maxH - 20) h *= self.data.yo;
					self.w = w;
					self.h = h;
					self.numChars = count;
					run();

				}, false);

				self.add2(0xD83D, 0xDE04, Math.random() * w | 0,
					Math.random() * h | 0);

			}());

			this.run();

		},

		run: function () {

			this.tick();

			requestAnimationFrame(function () {

				main.run();

			});

		},

		addOneUp: function (msg, x, y, dir, life) {

			var o = Object.create(OneUp).init(msg, x, y, dir, life);
			this.addFxEl(o.el);
			this.fx.push(o);

		},

		add: function (charCode, x, y) {

			var s = document.createElement("span");
			s.innerHTML = String.fromCharCode(charCode);
			s.className = "char";
			s.style.zIndex = Math.random () * 50 | 0;
			s.style.top = y + "px";
			s.style.left = x + "px";

			this.addEl(s);

			return s;

		},

		add2: function (cc1, cc2, x, y) {

			var s = this.add(cc1, x, y);
			s.innerHTML = String.fromCharCode(cc1, cc2);
			return s;

		},

		getAllChars: function () {

			return Array.prototype.slice.call(document.querySelectorAll(".char"));

		},

		sign: function (amount) {

			return (amount >= 0 ? "+" : "") + amount;

		},

		killChar: function (el) {

			var pos = this.getElPos(el);
			this.removeEl(el);
			var inn = el.innerHTML;
			if (inn.length === 2) {
				if (inn.charCodeAt(1) === 56836) {
					this.explode(pos);
				}
			}

			this.addOneUp(this.sign(this.data.scores.removeOne), pos.x, pos.y, -1);
			this.updateScore(this.data.scores.removeOne);
		},

		explode: function (pos) {

			var self = this;

			this.getAllChars().forEach(function (el) {
				if (el == this.snowman) {
					return;
				}
				var pos2 = self.getElPos(el),
					xo = pos.x - pos2.x,
					yo = pos.y - pos2.y;

				if (Math.sqrt(xo * xo + yo * yo) < 130) {
					this.killChar(el);
				}
			}, this);

		},

		shuffle: function (x, y) {

			Array.prototype.slice.call(document.querySelectorAll(".char"))
				.forEach(function (el) {
					el.style.zIndex = Math.random () * 50 | 0;
				});

			this.updateScore(this.data.scores.shuffle);
			this.addOneUp(this.sign(this.data.scores.shuffle), x, y, 1);

		},

		gets: function (x, y) {

			//x += this.boardPos.x;
			//y += this.boardPos.y;

			this.addOneUp(this.data.scores.snowman + "!!!", x, y, -0.5, 100);
			this.updateScore(this.data.scores.snowman);
			this.round++;

			if (this.round > 30 && this.data.count > 1.05) {
				this.data.count -= 0.008;
			}

		},

		tick: function () {

			var now = Date.now();

			if (now - this.last > 1000) {
				this.last = now;
				this.addOneUp(this.data.scores.timeSubtract, 20, 20, 1);
				this.updateScore(this.data.scores.timeSubtract);
			}

			this.fx = this.fx.filter(function (fx) {

				var res = fx.tick();
				if (!res) {
					this.removeFxEl(fx.el);
				}
				return res;

			}, this);

		},

		updateScore: function (amount) {
			this.score += amount;
			this.updateHUD();
		},

		addEl: function (el) {

			this.board.appendChild(el);

		},

		removeEl: function (el) {

			try {
				this.board.removeChild(el)
			} catch (e) {
				console.log("already gone")
			}

		},

		addFxEl: function (el) {

			this.fxDom.appendChild(el);

		},

		removeFxEl: function (el) {

			try {
				this.fxDom.removeChild(el)
			} catch (e) {
				console.log("already gone")
			}

		},

		getElPos: function (el) {

			var style = el.style,
				y = style.top,
				x = style.left,
				board = this.boardPos;


			return {
				x: parseInt(x, 10) + board.x,
				y: parseInt(y, 10) + board.y
			}

		},

		updateHUD: function () {
			document.querySelector("#score").innerHTML = this.score;
			document.querySelector("#round").innerHTML = this.round;
			document.querySelector("#stats").innerHTML = this.data.count + "--" + (this.numChars|0) + ":" + (this.w | 0) + ":" + (this.h |0);
		}

	}

	window.main = main;

}());
