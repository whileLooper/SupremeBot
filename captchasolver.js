function CaptchaSolver(key) {

  var anticaptcha = require('anticaptcha-nodejs')(key);

  this.solveCaptcha = function (url, websiteKey, callback, isTest) {
    if (isTest)
      return setTimeout(() => callback('123456'), 1* 1000);

    anticaptcha.setWebsiteURL(url);
    anticaptcha.setWebsiteKey(websiteKey);
    anticaptcha.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116");

    anticaptcha.getBalance(function (err, balance) {
      if (err) {
        console.error(err);
        return;
      }

      if (balance > 0) {
        anticaptcha.createTaskProxyless(function (err, taskId) {
          if (err) {
            console.error(err);
            return;
          }

          console.log("Captcha Task started:"+ taskId, new Date());

          anticaptcha.getTaskSolution(taskId, function (err, taskSolution) {
            if (err) {
              console.error(err);
              return;
            }

            console.log("Captcha Token Received: "+taskSolution, new Date());
            callback(taskSolution);
          });
        });
      }
    });
  };
}

exports.CaptchaSolver = CaptchaSolver;