// Usage: phantomjs index.js <mail> <pass>

// debug log
function debug_log(msg){
	// console.log(msg);
}

// コマンドライン引数受け取り
var system = require('system');
var args = system.args; // [0] ScriptName  [1] Arg  [2] Arg  ...
if (args.length < 3) {
	console.log(
		'Usage: phantomjs index.js <email> <password>'
	);
	phantom.exit(1);
}
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
	page.onConsoleMessage = function (msg) {
		console.log(msg);
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
			// debug_log("render.");
			// page.render("a.png");
			// 次の条件
			page.onLoadFinished = function () {
				step2();
			};
			// サインイン
			page.evaluate(function(mail, pass){
				jQuery('#ap_email').val(mail);
				jQuery('#ap_password').val(pass);
				jQuery('#signInSubmit-input').click();
			}, mail, pass);
		}
	);
}

// サインイン後の画面（注文履歴）
var years = [];
function step2(){
	// 候補年リスト
	years = page.evaluate(function(){
		var years = [];
		jQuery('#orderFilter option').each(function(){
			var year = jQuery(this).text().trim();
			if(year.match(/年$/)){
				years.push(year);
			}
		});
		return years;
	});

	// 最初の年について処理 (それ以降の年は再帰呼び出しで発行)
	step3(0, 0);
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
			step3(year_index, page_index + 1);
		};

		// 年選択
		page.evaluate(function(year){
			jQuery('#orderFilter').val(year);
			jQuery('#order-dropdown-form input[type="submit"]').click();
		}, year);
	}
	// ページめくり
	else{
		// 記録
		page.evaluate(function(){
			jQuery('.action-box').each(function(){
				var text = '';
				var order = jQuery(this);
				text = order.find('.order-level .info-data a').text().trim(); // 注文番号
				text += "," + order.find('.order-level h2').text().trim(); // 日付
				text += "," + order.find('.order-level .price').text().trim().replace(/[ ,]/g, ''); // 価格
				text += "," + order.find('.order-level .top-text').text().trim(); // 状態
				text += "," + order.find('.order-level .info-data.recipient').text().trim(); // 受取人
				order.find('.ship-listing .shipment > li').each(function(){
					var item = jQuery(this);
					text += "," + item.find('.item-title').text().trim(); // タイトル
				});
				console.log(text);
			});
		});

		// 次の条件
		page.onLoadFinished = function () {
			step3(year_index, page_index + 1);
		};

		// 次ページ
		var next = page.evaluate(function(){
			// 次ページ
			var next = jQuery('div.pagination-box a:contains("次へ")');
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
