const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const { tokenAlgorithm } = require('../config/globalParams');
const { rejects } = require('assert');

// 生成token方法
module.exports.sign = (payload) => {
  var privateKey = fs.readFileSync(
    path.resolve(__dirname, '../config/keys/rsa_token_private_key.pem')
  );
  var token = jwt.sign(payload, privateKey, {
    algorithm: tokenAlgorithm,
    expiresIn: '72h',
  });
  return token;
};

// 验证token方法
module.exports.verify = (token) => {
  var key = fs.readFileSync(
    path.resolve(__dirname, '../config/keys/rsa_token_public_key.pem')
  ); // get public key
  return new Promise((resolve, reject) => {
    let userInfo = jwt.verify(token.split(' ')[1], key);
    // console.log(userInfo);
    resolve(userInfo);
  }).catch((e) => {
    console.log('verify token error: ', e);
  });
};
