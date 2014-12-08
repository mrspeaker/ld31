(function () {

	"use strict";

	var main = {

		debug: false,

		maxW: 1024,
		maxH: 576,

		round: 0,
		score: 0,
		roundHighest: 0,

		last: Date.now(),

		bonusBomb: true,
		shakeTime: 0,

		ini: null,

		headerHeight: 80,

		data: {

			scores: {
				start: 20,
				removeOne: 1,
				shuffle: -20,
				snowman: 10,
				timeSubtract: -3
			},

			bounds: {
				w: 100, //1024,
				h: 100 //576
			},

			startChars: 2, //502,
			xGrowSpeed: 1.06,
			yGrowSpeed: 1.04,
			charGrowSpeed: 1.15,

			bombEvery: 90

		},

		uni: {

			bomb: [55357, 56483],
			poo: [55357, 56489],
			snowman: 9731,
			arrow: 0x21E7,
			startCodes: 9000

		},

		okToUseUnicodes: null,
		unicodeIndx: 0,

		fx: null,

		numChars: 0,

		init: function () {

			this.ini = utils.clone(this.data);

			var okcode = [];
			[
				[9472, 9599], //Box Drawing
				[9600, 9621], //Block Elements
				[9632, 9711],
				[9985, 10174], // Dingbats
				[9312, 9470], // Enclosed Alphanumerics
				[8704, 8941], // Mathematical Operators
				[8592, 8682], // Arrows
				[384, 591],
				[162, 255], // bolded 1/4 etc..
				[9728, 9839]
			].forEach(function (r) {
				for (var i = r[0]; i < r[1]; i++) {
					okcode.push(i);
				}
			}, this);

			this.okToUseUnicodes = okcode.sort(function () { return Math.random() < 0.5; } );
			console.log(this.okToUseUnicodes.length);

			this.sounds = {
				blip: Object.create(Sound).init("res/sounds/blip", 0.8),
				get1: Object.create(Sound).init("res/sounds/get", 0.85),
				get2: Object.create(Sound).init("res/sounds/get2", 1),
				miss: Object.create(Sound).init("res/sounds/miss", 0.7),
				splode: Object.create(Sound).init("res/sounds/splode", 0.7),
				theme: Object.create(Sound).init("res/sounds/theme", 0.7, true)
			};

			this.sounds.theme.play();

			this.fx = [];

			var snowman = this.uni.snowman,
				start = this.uni.startCodes,
				board = document.querySelector("#board");

			this.board = board;
			this.boardPos = {
				x: board.offsetLeft,
				y: board.offsetTop
			}
			this.setTransformProperty();

			this.fxDom = document.querySelector("#fx");

			board.addEventListener("click", (function (e) {

				_d = (++_d||(+[]));

				var isChar = e.target.classList.contains("char");

				if (!isChar) {
					this.sounds.miss.play();
					this.shuffle(e.pageX, e.pageY);
				} else {
					this.killChar(e.target);
				};

			}).bind(this));

			document
				.querySelector("#giveUp")
				.addEventListener("click", (function () {
					var msg = "You've found " + this.round + " ☃'s";
					msg += "\nAnd earned " + this.score + " dollars.";
					msg += "\n\nScreenshot this dialog and post to @mrspeaker,";
					msg += "\nand he'll add you to the mighty hi-score list."
					msg += "\n\nSure you want to restart? [" + _d.toString(16).toUpperCase() + "]";
					if (confirm(msg)) {
						this.reset();
					}
				}).bind(this), false);

			this.reset();
			this.run();

		},

		reset: function () {

			this.data = utils.clone(this.ini);
			this.score = this.data.scores.start;
			this.roundHighest = 0;
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

			while (board.firstChild) {
    			board.removeChild(board.firstChild);
			}

		},

		populateField: function () {

			var start = this.unicodeIndx,
				codes = this.okToUseUnicodes,
				codesLen = codes.length;

			for (var i = 0; i < this.numChars; i++) {
				var code = codes[(start + i) % codesLen];
				if (code === this.uni.snowman) continue;
				var randPos = this.randPos();
				this.add(
					code,
					randPos.x,
					randPos.y
				);
			}

			this.unicodeIndx = (start + i) % codesLen;

		},

		addSpecials: function () {

			// Add snowman
			var randPos = this.randPos(true);
			var snowy = this.snowman = this.add(
				this.uni.snowman,
				randPos.x,
				randPos.y);

			if (this.debug) {
				snowy.style.backgroundColor = "red";
			}

			snowy.addEventListener("mousedown", (function win (e) {

				e.preventDefault();
				snowy.removeEventListener("mousedown", win);

				this.gets(e.pageX, e.pageY);

			}).bind(this), false);

			// Add bombs
			var bombs = (this.numChars / this.data.bombEvery) | 0;
			if (bombs > 4) bombs = 4;
			if (this.round > 0 && (this.bonusBomb || Math.random() < 0.15)) bombs++;

			for (var i = 0; i < bombs; i++) {
				randPos = this.randPos();
				var b = this.add2(
					this.uni.bomb,
					randPos.x,
					randPos.y);
				b.innerHTML = "&nbsp";
				b.classList.add("bomb");
				b.style.color = "hsl(100, 50%, 50%)";

			}

			/*// Add pointing arrows
			var arrows = (this.numChars / (this.data.bombEvery * 4)) | 0;
			if (this.round > 4 && this.round < 25 && Math.random() < 0.1) arrows++;

			for (i = 0; i < arrows; i++) {
				randPos = this.randPos();
				var a = this.add(
					this.uni.arrow,
					randPos.x,
					randPos.y);
				a.classList.add("special");
			}*/

		},

		randPos: function (ensureIn) {

			var w = this.data.bounds.w,
				h = this.data.bounds.h,
				xo = (this.maxW - w) / 2,
				yo = (this.maxH - h) / 2,
				rx = Math.random() * w,
				ry = Math.random() * h,
				x = ((rx + xo) | 0) - 15,
				y = ((ry + yo) | 0) - 15;

			if (ensureIn) {
				if (x < 0) x = 0;
				if (x > this.maxW - 25) x = this.maxW - 25;
				if (y < 0) y = 0;
				if (y > this.maxH - 35) y = this.maxH - 35;
			}

			return {
				x: x,
				y: y
			}

		},

		addOneUp: function (msg, x, y, dir, life) {

			if (this.fx.length > 15) {
				return;
			}

			var o = Object.create(OneUp).init(msg, x, y, dir, life);
			this.addFxEl(o.el);
			this.fx.push(o);

		},

		addParticle: function (x, y) {

			var o = Object.create(Particle).init(x, y, Math.random() * (Math.PI*2));
			this.addFxEl(o.el);
			this.fx.push(o);

		},

		add: function (charCode, x, y) {

			var s = document.createElement("span");
			s.innerHTML = String.fromCharCode(charCode);
			s.classList.add("char");
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

		setTransformProperty: function () {

		    var	board = this.board,
		    	properties = [
			        'transform',
			        'WebkitTransform',
			        'msTransform',
			        'MozTransform',
			        'OTransform'
			    ],
		    	p;
		    while (!p && (p = properties.shift())) {
		        if (typeof board.style[p] != 'undefined') {

		        } else {
		        	p = null
		        }
		    }
		    this.rotateProp = p;

		},

		killChar: function (el, byChar) {

			var pos = this.getElPos(el);
			var inn = el.innerHTML;

			var remover = (function () {
				this.removeEl(el);
				this.addOneUp(this.sign(this.data.scores.removeOne), pos.x, pos.y, -1);
				this.updateScore(this.data.scores.removeOne);
			}).bind(this);

			if (inn.charCodeAt(0) === this.uni.arrow) {

				/*if (this.rotateProp) {
					var dx = el.offsetLeft - this.snowman.offsetLeft,
					    dy = el.offsetTop - this.snowman.offsetTop,
					    angle = Math.atan2(dy, dx) - (Math.PI / 2);

					el.style[this.rotateProp] = "rotate(" + angle + "rad)";
				}*/
				//var thingos =

			}
			else if (el.classList.contains("bomb")) {

				//if (inn.charCodeAt(1) === this.uni.bomb[1]) {
				//if (el.classList.contain("bomb")) {
					remover();
					this.bonusBomb = false;
					if (byChar) {
						setTimeout((function () {

							this.explode(pos);

						}).bind(this), 300);
					}
					else {
						this.sounds.splode.play();
						this.explode(pos);
					}
				//}

			}
			else {
				if (!byChar) {
					this.sounds.blip.play();
				}
				remover();
			}

		},

		explode: function (pos) {

			var self = this;

			this.shakeTime = 25;

			this.getAllChars().forEach(function (el) {

				if (el == this.snowman) {
					return;
				}

				var pos2 = self.getElPos(el),
					xo = pos.x - pos2.x,
					yo = pos.y - pos2.y;

				if (Math.sqrt(xo * xo + yo * yo) < 80) {
					this.killChar(el, true);
				}

			}, this);

		},

		shuffle: function (x, y) {

			Array.prototype.slice.call(document.querySelectorAll(".char"))
				.forEach(function (el) {

					el.style.zIndex = Math.random () * 50 | 0;

				});

			var shuffleCost = Math.max(this.data.scores.shuffle, -(this.data.scores.snowman / 5) | 0);
			this.updateScore(shuffleCost);
			this.addOneUp(this.sign(shuffleCost), x, y - this.headerHeight, 1);

		},

		gets: function (x, y) {

			this.sounds[Math.random() < 0.6 ? "get1" : "get2"].play();

			var bb = this.data.bounds;

			if (bb.w < this.maxW - 20) bb.w *= this.data.xGrowSpeed;
			if (bb.h < this.maxH - 20) bb.h *= this.data.yGrowSpeed;

			this.addOneUp("$" + this.data.scores.snowman, x, y - (this.headerHeight + 30), -0.5, 100);
			this.updateScore(this.data.scores.snowman);

			this.roundHighest = this.score;

			if (this.data.scores.snowman < 100) {
				this.data.scores.snowman = this.data.scores.snowman * 1.1 | 0;
			}

			this.round++;

			if (this.round > 30 && this.data.count > 1.05) {
				this.data.count -= 0.008;
			}

			for (var i = 0; i < 20; i++) {
				this.addParticle(x, y - (this.headerHeight + 20))
			}

			this.numChars *= this.data.charGrowSpeed;
			this.nextLevel();

			this.updateHUD();

		},

		tick: function () {

			var now = Date.now();

			if (this.shakeTime > 0) {
				this.board.style.left = (Math.random() * 10 - 5 | 0) + "px";
				this.board.style.top = (Math.random() * 10 - 5 | 0) + "px";
				if (--this.shakeTime <= 0) {
					this.board.style.left = 0;
					this.board.style.top = 0;
				}
			}

			if (now - this.last > 1000) {
				this.last = now;
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

			if (this.score > this.roundHighest) {
				this.roundHighest = this.score;
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
			document.querySelector("#score").innerHTML = "$" + this.score;
			document.querySelector("#round").innerHTML =  "☃" + this.round;
			//document.querySelector("#stats").innerHTML = (this.numChars | 0) + ":" + (d.bounds.w | 0) + ":" + (d.bounds.h |0);
		}

	}

	window.main = main;

}());

_d=0;"lol";

