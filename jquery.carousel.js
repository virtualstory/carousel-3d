;(function(){
	$.fn.carousel = function(options) {
		// 总 默认设置		
		let defaultSettings = {
			'itemGap': 10, // 每个.item的距离
			'speed': 3000, // ms/次
			'isLeft2Right': false, // 滚动方向是否为从左往右
			'numFront': 5, // 大于1，少于.item的个数
			'hasPreNext': true, // 是否有 前一张 后一张 按钮
		};

		// .carousel 默认样式设置
		let defaultCarousel = {
			'width': $(this).width() || 1000,
			'height': 320,
			'backgroundColor': '#eee',
			'position': 'relative',
		};

		// .item 默认样式设置
		let defaultItem = {
			'width': 100,
			'height': 300,
			// 'backgroundColor': '#369',
			'position': 'absolute',
			'top': 10,
			'transition': 'all 1s linear',
		};

		// .carousel 样式设置
		let carousel = $.extend({}, defaultCarousel, options.carousel);
		let _this = this;
		this.css(carousel);

		// .item 样式设置
		let item = $.extend({}, defaultItem, options.item);
		let $oItem = this.find(".item");
		$oItem.css(item);

		// 左右 按钮
		let $pre = $("<canvas class='pre'></canvas>");
		let $next = $("<canvas class='next'></canvas>");

		// 总设置
		let settings = $.extend({}, defaultSettings, options, {
			carousel: carousel,
			item: item,
		});

		// 变化的状态
		let state = {
			'oFrontItem': $.makeArray($oItem.slice(0, defaultSettings.numFront)),
			'oBackItem': $.makeArray($oItem.slice(defaultSettings.numFront)),
			'paddingLeft': (settings.carousel.width - (settings.numFront - 1) * settings.itemGap - settings.numFront * settings.item.width)/2,
			'timer': null,
			'hasCarousel': true,
			'isBackward': true, // 后一张？
		};



		settings.hasPreNext && checkPreNext();

		// 是否有 前一张 和 下一张 按钮
		function checkPreNext(){
			// 插入到.carousel中
			$oItem.eq(0).before($pre);
			_this.append($next);

			// 左右按钮 公共样式
			_this.find(".pre, .next").css({
				'backgroundColor': '#aaa',
				'width': 100,
				'height': '100%',
				'position': 'absolute',
				'top': 0,

			});

			// 左按钮 样式 和 事件
			$pre.css({
				'left': 0,
			}).on('click', function(e) {
				console.log("点击了左边的按钮");
				clearInterval(state.timer);
				settings.isLeft2Right ? preItem() : nextItem();
				state.timer = setTimeout(() => {
					move();
				}, 5000);
			});

			// 右按钮 样式 和 事件
			$next.css({
				'right': 0,
			}).on('click', function(e) {
				console.log("点击了右边的按钮");
				clearInterval(state.timer);
				settings.isLeft2Right ? nextItem() : preItem();
				state.timer = setTimeout(() => {
					move();
				}, 5000);
			});

			// $preContext = $pre.get(0).getContext("2d");
			// $preContext.beginPath();
			// $preContext.fillRect(0,0,50,100);
			// $preContext.closePath();

		}




		checkNumItem();
		
		function checkNumItem() {
			if($oItem.length <= 2) {
				state.hasCarousel = false;
			}
		}

		// 初始化样式
		render();

		// 重置样式
		function render() {
			state.oFrontItem.map((v, k) => {
				let mid = (settings.numFront - 1)/2;
				let zIndex = 0;
				if(settings.isLeft2Right) { // 从左往右
					if(state.isBackward) {  //  后一张
						zIndex = 10 * (state.oFrontItem.length + k);
					} else {	// 前一张
						zIndex = 10 * (state.oFrontItem.length - k);
					}
				} else { // 从右往左
					if(state.isBackward) { // 后一张
						zIndex = 10 * (state.oFrontItem.length - k);
					} else { // 前一张
						zIndex = 10 * (state.oFrontItem.length + k);
					}
				}
				$(v).css({
					'left': state.paddingLeft + (settings.item.width + settings.itemGap) * k,
					'transform': state.hasCarousel ? 'scale(' + (1 - Math.abs(mid - k) * 0.2) + ')' : 'none',
					'opacity': 1,
					'z-index': zIndex,
				});
			});

			state.oBackItem.map((v, k) => {
				$(v).css({
					'left': (settings.carousel.width - settings.item.width)/2,
					'transform': 'scale(0.1)',
					'opacity': 0,
					'z-index': 0,
				});
			});
		}

		// 开始运动
		state.hasCarousel && move();

		// 运动
	  function move(){
			state.timer = setInterval(() => {
				settings.isLeft2Right ? left2right() : right2left();
			}, settings.speed);
		}

		// 鼠标移入 停止滚动
		$oItem.on('mouseenter', function(e){
			state.hasCarousel && clearInterval(state.timer);
		});

		// 鼠标移出 继续滚动
		$oItem.on('mouseout', function(e){
			state.hasCarousel && move();
		});

		// .item 点击 
		$oItem.on('click', function(e){
			// console.log($(e.target).prevAll(".item").length);
			state.hasCarousel && turnToItem($(e.target).prevAll(".item").length + 1)
		});

		// 跳转到第n个 .item
		function turnToItem(n) {
			// $oItem.
			let firstIndex = n - (settings.numFront - 1)/2;
			if(firstIndex <= 0) {
				firstIndex = $oItem.length + firstIndex;
			}

			// let frontItems = $.makeArray($oItem.slice(firstIndex, settings.numFront + firstIndex));
			let frontItems = [];

			console.log(firstIndex)
			

			for(let i = firstIndex - 1; i < settings.numFront; i++) {
				frontItems.push($.makeArray($oItem.eq(i)));
			}

			console.log(frontItems);

		}

		// 下一个 .item
		function nextItem() {
			console.log("下一张");
			state.isBackward = true;
			settings.isLeft2Right ? left2right() : right2left();
		}

		// 前一个 .item
		function preItem() {
			console.log("前一张");
			state.isBackward = false;
			settings.isLeft2Right ? right2left() : left2right();
		}

		// 从右往左
		function right2left() {
			state.oBackItem.push(state.oFrontItem.splice(0,1)[0]);
			state.oFrontItem.push(state.oBackItem.splice(0,1)[0]);
			render();
		}

		// 从左往右
		function left2right() {
			state.oBackItem.unshift(state.oFrontItem.splice(state.oFrontItem.length - 1)[0]);
			state.oFrontItem.unshift(state.oBackItem.splice(state.oBackItem.length - 1)[0]);
			render();
		}

	};
})();
