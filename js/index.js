// Usage: phantomjs index.js <mail> <pass>

// debug log
function debug_log(msg){
	console.log(msg);
}

// コマンドライン引数受け取り
var system = require('system');
var args = system.args; // [0] ScriptName  [1] Arg  [2] Arg  ...
/*
if (args.length < 3) {
	console.log(
		'Usage: phantomjs index.js <email> <password>'
	);
	phantom.exit(1);
}
*/
var mail = args[1];
var pass = args[2];
debug_log("E: " + mail);
debug_log("P: " + 'xxxx');

// エンジン準備
var page = require('webpage').create();
if(true){
	page.settings.userAgent = 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2062.103 Safari/537.36';
	page.onResourceError = function(resourceError) {
		page.reason = resourceError.errorString;
		page.reason_url = resourceError.url;
		if(resourceError.errorString === 'Operation canceled')return;
		debug_log("-- onResourceError --");
		debug_log(resourceError.errorString);
		debug_log(resourceError.url);
		// phantom.exit(1);
	};

	// confirmが出たらOKを押す
	page.onConfirm = function (msg) {
		debug_log('CONFIRM: ' + msg);
		return true; // `true` === pressing the "OK" button, `false` === pressing the "Cancel" button
	};

	// alertが出たら記録
	page.onAlert = function(msg) {
		debug_log('ALERT: ' + msg);
	};

	// console.logをすべて手前に転送する (これでevaluate内のconsole.logも表示される)
	var render_index = 0;
	page.onConsoleMessage = function (msg) {
		console.log(msg);
		if(msg === 'render'){
			page.render((render_index++) + ".png");
		}
	};

	// 画面サイズ
	page.viewportSize = { width: 1000, height: 800 };
}

// 初回オープン（サインイン)
function step1(){
	debug_log("-- step1 --");
	var url = 'https://www.amazon.co.jp/gp/css/order-history';
	page.open(url,
		function () {
			page.includeJs("https://ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.js", function() {
				page.evaluate(function(){
					jQuery.noConflict();
				});
				// debug_log("render.");
				// page.render("a.png");
				// 次の条件
				// console.log("step1-1");
				// page.render('step1-1.png');
				page.onLoadFinished = function () {
					page.onLoadFinished = null;
					step2();
				};
				// サインイン
				// console.log("step1-2");
				// page.render('step1-2.png');
				page.evaluate(function (mail, pass) {
					setTimeout(function () {
						console.log("input email");
						jQuery('#ap_email').val(mail);
						console.log("render");
					}, 100);
					setTimeout(function () {
						console.log("input password");
						jQuery('#ap_password').val(pass);
						console.log("render");
					}, 200);
					setTimeout(function () {
						console.log("input submit");
						// jQuery('#ap_signin_form').submit();
						jQuery('#signInSubmit-input').click();
						console.log("render");
					}, 500);
				}, mail, pass);
				// console.log("step1-3");
				// page.render('step1-3.png');
			});
		}
	);
}

// サインイン後の画面（注文履歴）
var years = [];
function step2(){
	// console.log("step2-1");
	// page.render('step2-1.png');

	// jquery
	console.log("including jQuery...");
	setTimeout(function(){
		var cnt = 0;
		page.includeJs("https://ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.js", function(){
			page.evaluate(function(){
				jQuery.noConflict();
			});
			if(cnt++ > 0)return; // 重複防止
			console.log("jQuery included.");
			page.evaluate(function(){
				jQuery.noConflict();
			});
			console.log("no conflict ok.");

			// 実験
			console.log("---- Jikken3 ----");
			page.evaluate(function(){
				var i = 0;
				jQuery('a').each(function(){
					if(i++ > 5)return;
					var href = jQuery(this).attr('href');
					console.log(href);
				});
			});
			console.log("---- /jikken ----");

			// CSSパス
			/*
			function ElementCssPath(e){
				var rightArrowParents = [];
				e.parents().not('html').each(function() {
					var entry = this.tagName.toLowerCase();
					if (this.className) {
						entry += "." + this.className.replace(/ /g, '.');
					}
					if(this.id){
						entry += "#" + this.id;
					}
					rightArrowParents.push(entry);
				});
				rightArrowParents.reverse();
				return rightArrowParents.join(" ");
			}
			*/

			// 候補年リスト
			years = page.evaluate(function(){
				console.log("-----------hoge1");
				jQuery('option').each(function(){
					var t = jQuery(this).text().trim();
					//console.log(t + "    " + ElementCssPath(jQuery(this)));
				});
				console.log("-----------hoge2");
				jQuery('a').each(function(){
					var t = jQuery(this).text().trim();
					//console.log(t + "    " + ElementCssPath(jQuery(this)));
				});
				console.log("-----------hoge3");
				var years = [];
				jQuery('#timePeriodForm option').each(function(){
					console.log("hoge1");
					var year = jQuery(this).text().trim();
					if(year.match(/年$/)){
						years.push(year);
					}
				});
				return years;
			});

			// 年確認
			console.log("--years--");
			console.log(years);
			console.log("---------")
		});
	}, 1000);


	// 最初の年について処理 (それ以降の年は再帰呼び出しで発行)
	setTimeout(function(){
		console.log("----goto step3");
		step3(0, 0);
	}, 3000);

}

// サインイン後の画面（注文履歴）
function step3(year_index, page_index){
	debug_log("-- step3 --");

	// すべての年の処理が完了していたらプログラム終了
	if(year_index >= years.length){
		phantom.exit(0);
	}

	// 年
	var year = years[year_index];

	// 年選択
	if(page_index === 0){
		// 年ラベル
		debug_log("========== " + year + " ==========");

		// 次の条件
		page.onLoadFinished = function () {
			page.onLoadFinished = null;
			page.includeJs("https://ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.js", function(){
				page.evaluate(function(){
					jQuery.noConflict();
				});
				step3(year_index, page_index + 1);
			});
		};

		// 年選択
		page.evaluate(function(year){
			jQuery('select.a-native-dropdown[name=orderFilter]').val('year-' + parseInt(year));
			jQuery('#timePeriodForm').submit();
		}, year);
	}
	// ページめくり
	else{
		// 記録
		console.log("----kiroku");
		page.evaluate(function(){
			jQuery('.order').each(function(){
				var text = '';
				var order = jQuery(this);
				text = order.find('.a-col-right .value').text().trim(); // 注文番号
				text += "," + order.find('.a-span3 .value').text().trim(); // 日付
				text += "," + order.find('.a-span2 .value').text().trim().replace(/[ ,]/g, ''); // 価格
				text += "," + order.find('.shipment-top-row .a-text-bold:first').text().trim(); // 状態
				text += "," + order.find('.a-span7 .value').text().trim(); // 受取人
				order.find('.a-row > .a-link-normal').each(function(){
					var item = jQuery(this);
					text += "," + item.text().trim(); // タイトル
				});
				console.log(text);
			});
		});

		// 次の条件
		page.onLoadFinished = function () {
			page.onLoadFinished = null;
			page.includeJs("https://ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.js", function() {
				page.evaluate(function(){
					jQuery.noConflict();
				});
				step3(year_index, page_index + 1);
			});
		};

		// 次ページ
		var next = page.evaluate(function(){
			// 次ページ
			var next = jQuery('li.a-last a:contains("次へ")');
			if(next.size() == 1){
				location.href = next.attr('href');
				return true;
			}
			else{
				return false;
			}
		});
		if(!next){
			// 次の年
			step3(year_index + 1, 0);
		}
	}
}

// 実行
step1();
