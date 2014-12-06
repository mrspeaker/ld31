(function () {

	"use strict";

	var main = {

		maxW: 1024,
		maxH: 576,

		round: 0,
		score: 1000,
		highest: 0,
		highestEver: 0,
		last: Date.now(),

		bonusBomb: true,

		debug: false,

		data: {
			scores: {
				removeOne: 5,
				shuffle: -1001,
				snowman: 3100,
				timeSubtract: -30
			},
			bounds: {
				w: 100,
				h: 100
			},
			xo: 1.06,
			yo: 1.04,
			count: 1.15,
			bombEvery: 80
		},

		uni: {

			bomb: [55357, 56483],
			poo: [55357, 56489],
			snowman: 9731,
			startCodes: 9000

		},

		fx: null,

		numChars: 0,

		init: function () {

			var self = this;

			this.updateHUD();

			this.fx = [];

			var snowman = this.uni.snowman,
				start = this.uni.startCodes,
				board = document.querySelector("#board");
			var self = this;

			this.board = board;
			this.boardPos = {
				x: board.offsetLeft,
				y: board.offsetTop
			}
			this.fxDom = document.querySelector("#fx");

			document.querySelector("#giveUp").addEventListener("click", function () {

				self.reset();

			}, false);

			board.addEventListener("click", function (e) {
				if (e.target.className !== "char") {
					self.shuffle(e.pageX, e.pageY);
				} else {
					self.killChar(e.target);
				}
			});

			var round = 1,
				count = 2,
				bb = this.data.bounds;

			(function run () {

				var randPos;

				board.innerHTML = "";
				for (var i = 0; i < count; i++) {
					if (start + i === snowman) continue;
					var randPos = self.randPos();
					self.add(
						start + i,
						randPos.x,
						randPos.y
					);
				}

				randPos = self.randPos();
				var snowy = self.snowman = self.add(
					snowman,
					randPos.x,
					randPos.y);

				if (self.debug) {
					snowy.style.backgroundColor = "red";
				}

				snowy.addEventListener("mousedown", function win (e) {

					self.gets(e.pageX, e.pageY);
					e.preventDefault();
					snowy.removeEventListener("mousedown", win);
					count *= self.data.count;
					self.numChars = count;
					run();

				}, false);

				var bombs = (count / self.data.bombEvery) | 0;
				if (self.bonusBomb || Math.random() < 0.2) bombs++;

				for (var i = 0; i < bombs; i++) {
					randPos = self.randPos();
					self.add2(
						self.uni.bomb,
						randPos.x,
						randPos.y);
				}

			}());

			this.run();

		},

		reset: function () {

			if (this.highest > this.highestEver) {
				this.highestEver = this.highest;
			}

		},

		run: function () {

			this.tick();

			requestAnimationFrame(function () {

				main.run();

			});

		},

		randPos: function () {

			var w = this.data.bounds.w,
				h = this.data.bounds.h,
				xo = (this.maxW - w) / 2,
				yo = (this.maxH - h) / 2,
				rx = Math.random() * w,
				ry = Math.random() * h;

			return {
				x: (rx + xo) | 0,
				y: (ry + yo) | 0
			}

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

		add2: function (charCodes, x, y) {

			var s = this.add(charCodes[0], x, y);
			s.innerHTML = String.fromCharCode(charCodes[0], charCodes[1]);
			return s;

		},

		getAllChars: function () {

			return Array.prototype.slice.call(document.querySelectorAll(".char"));

		},

		sign: function (amount) {

			return (amount >= 0 ? "+" : "") + amount;

		},

		killChar: function (el, byChar) {

			var pos = this.getElPos(el);
			this.removeEl(el);
			var inn = el.innerHTML;
			if (inn.length === 2) {

				if (inn.charCodeAt(1) === this.uni.bomb[1]) {
					this.bonusBomb = false;
					if (byChar) {
						setTimeout((function () {
							this.explode(pos);
						}).bind(this), 300);
					}
					else {
						this.explode(pos);
					}
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
					this.killChar(el, true);
				}
			}, this);

		},

		shuffle: function (x, y) {

			Array.prototype.slice.call(document.querySelectorAll(".char"))
				.forEach(function (el) {
					el.style.zIndex = Math.random () * 50 | 0;
				});

			this.updateScore(this.data.scores.shuffle);
			this.addOneUp(this.sign(this.data.scores.shuffle), x, y - 50, 1);

		},

		gets: function (x, y) {

			var bb = this.data.bounds;

			if (bb.w < this.maxW - 20) bb.w *= this.data.xo;
			if (bb.h < this.maxH - 20) bb.h *= this.data.yo;

			this.addOneUp(this.data.scores.snowman + "!!!", x, y - 80, -0.5, 100);
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
				//this.addOneUp(this.data.scores.timeSubtract, 20, 20, 1);
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

			if (this.score > this.highest) {
				this.highest = this.score;
			}

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
			var d = this.data;
			document.querySelector("#score").innerHTML = this.score;// + " Game hi:" +this.highest + " Best:" + this.highestEver + "<br/>";
			document.querySelector("#round").innerHTML = this.round;
			//document.querySelector("#stats").innerHTML = d.count.toFixed(2) + "--" + (this.numChars|0) + ":" + (d.bounds.w | 0) + ":" + (d.bounds.h |0);
		}

	}

	window.main = main;

}());
