'use strict';
var AV = require('leanengine');

/**
 * 一个简单的云代码方法
 */
AV.Cloud.define('hello', function (request, response) {
  response.success('Hello world!');
});

AV.Cloud.define('testDic', (req, res) => {
  let data = {
    testDate: new Date(),
    testNumber: 1123,
    testString: 'Typescript is greate,JavaScript is sucks.'
  };
  res.success(data);
});

module.exports = AV.Cloud;
