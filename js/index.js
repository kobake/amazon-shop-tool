// Usage: phantomjs index.js <mail> <pass>

// コマンドライン引数受け取り
var system = require('system');
var args = system.args; // [0] ScriptName  [1] Arg  [2] Arg  ...
if (args.length < 3) {
	console.log(
		'Usage: phantomjs mapcap.js <email> <password>'
	);
	Util.exit(1);
}
var mail = args[1];
var pass = args[2];
console.log("E: " + mail);
console.log("P: " + 'xxxx');

// エンジン準備
var page = require('webpage').create();
if(true){
	page.settings.userAgent = 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2062.103 Safari/537.36';
	page.onResourceError = function(resourceError) {
		page.reason = resourceError.errorString;
		page.reason_url = resourceError.url;
		if(resourceError.errorString === 'Operation canceled')return;
		console.log("-- onResourceError --");
		console.log(resourceError.errorString);
		console.log(resourceError.url);
		// phantom.exit(1);
	};

	// confirmが出たらOKを押す
	page.onConfirm = function (msg) {
		console.log('CONFIRM: ' + msg);
		return true; // `true` === pressing the "OK" button, `false` === pressing the "Cancel" button
	};

	// alertが出たら記録
	page.onAlert = function(msg) {
		console.log('ALERT: ' + msg);
	};

	// console.logをすべて手前に転送する (これでevaluate内のconsole.logも表示される)
	page.onConsoleMessage = function (msg) {
		console.log("CONSOLE: " + msg);
	};

	// 画面サイズ
	page.viewportSize = { width: 1000, height: 800 };
}

// 初回オープン（サインイン)
function step1(){
	console.log("-- step1 --");
	var url = 'https://www.amazon.co.jp/gp/css/order-history';
	page.open(url,
		function () {
			console.log("render.");
			page.render("a.png");
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
function step2(){
	console.log("-- step2 --");
	// 記録
	page.evaluate(function(){
		jQuery('.action-box').each(function(){
			console.log("--------------------");
			var item = jQuery(this);
			console.log(item.find('.order-level .info-data a').text().trim()); // 注文番号
			console.log(item.find('.order-level h2').text().trim()); // 日付
			console.log(item.find('.item-title').text().trim()); // タイトル
			console.log(item.find('.order-level .price').text().trim()); // 価格
			console.log(item.find('.order-level .top-text').text().trim()); // 状態
			console.log(item.find('.order-level .info-data.recipient').text().trim()); // 受取人
			console.log(item.find('.product-group-name').text().trim()); // Kindle or not
		});
	});
	// 次の条件
	page.onLoadFinished = function () {
		step2();
	};
	// 次へ
	var next = page.evaluate(function(){
		// 次へ
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
		// 終わり
		phantom.exit(0);
	}
}

// 実行
step1();
