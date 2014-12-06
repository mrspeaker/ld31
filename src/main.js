(function () {

	"use strict";

	var main = {

		maxW: 1024,
		maxH: 576,

		round: 0,

		score: 0,
		highest: 0,
		highestEver: 0,

		last: Date.now(),

		bonusBomb: true,

		debug: false,

		ini: null,
		data: {

			scores: {
				start: 100,
				removeOne: 1,
				shuffle: -20,
				snowman: 100,
				timeSubtract: -2
			},

			bounds: {
				w: 100,
				h: 100
			},

			startChars: 2,
			xGrowSpeed: 1.06,
			yGrowSpeed: 1.04,
			charGrowSpeed: 1.15,

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

			this.ini = utils.clone(this.data);

			this.fx = [];

			var snowman = this.uni.snowman,
				start = this.uni.startCodes,
				board = document.querySelector("#board");

			this.board = board;
			this.boardPos = {
				x: board.offsetLeft,
				y: board.offsetTop
			}
			this.fxDom = document.querySelector("#fx");

			board.addEventListener("click", (function (e) {

				var isChar = e.target.className !== "char";

				if (isChar) {
					this.shuffle(e.pageX, e.pageY);
				} else {
					this.killChar(e.target);
				}

			}).bind(this));

			document
				.querySelector("#giveUp")
				.addEventListener("click", this.reset.bind(this), false);

			this.reset();
			this.run();

		},

		reset: function () {

			if (this.highest > this.highestEver) {
				this.highestEver = this.highest;
			}

			this.data = utils.clone(this.ini);
			this.score = this.data.scores.start;
			this.round = 0;
			this.numChars = this.data.startChars;

			this.updateHUD();

			this.nextLevel();

		},

		run: function () {

			this.tick();

			requestAnimationFrame(function () {

				main.run();

			});

		},

		nextLevel: function () {

			this.clearField();
			this.populateField();
			this.addSpecials();

		},

		clearField: function () {

			this.board.innerHTML = "";

		},

		populateField: function () {

			var start = this.uni.startCodes;

			for (var i = 0; i < this.numChars; i++) {
				if (start + i === this.uni.snowman) continue;
				var randPos = this.randPos();
				this.add(
					start + i,
					randPos.x,
					randPos.y
				);
			}

		},

		addSpecials: function () {

			// Add snowman
			var randPos = this.randPos();
			var snowy = this.snowman = this.add(
				this.uni.snowman,
				randPos.x,
				randPos.y);

			if (this.debug) {
				snowy.style.backgroundColor = "red";
			}

			snowy.addEventListener("mousedown", (function win (e) {

				this.gets(e.pageX, e.pageY);
				e.preventDefault();
				snowy.removeEventListener("mousedown", win);
				this.numChars *= this.data.charGrowSpeed;

				this.nextLevel();

			}).bind(this), false);

			// Add bombs
			var bombs = (this.data.numChars / this.data.bombEvery) | 0;
			if (this.round > 0 && (this.bonusBomb || Math.random() < 0.2)) bombs++;

			for (var i = 0; i < bombs; i++) {
				randPos = this.randPos();
				this.add2(
					this.uni.bomb,
					randPos.x,
					randPos.y);
			}

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

			if (bb.w < this.maxW - 20) bb.w *= this.data.xGrowSpeed;
			if (bb.h < this.maxH - 20) bb.h *= this.data.yGrowSpeed;

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
			if (this.score < 0) {
				this.score = 0;
			}

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
