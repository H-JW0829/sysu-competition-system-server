const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const rsaPublicKey = fs
  .readFileSync(path.resolve(__dirname, 'keys/rsa_public_key.pem'))
  .toString('utf-8');
const rsaPrivateKey = fs
  .readFileSync(path.resolve(__dirname, 'keys/rsa_private_key.pem'))
  .toString('utf-8');

// const password = 'test';
// //加密
// const encodeData = crypto
//   .publicEncrypt(rsaPublicKey, Buffer.from(password))
//   .toString('base64');
// console.log('encode: ', encodeData);

// //解密
// const decodeData = crypto.privateDecrypt(
//   rsaPrivateKey,
//   Buffer.from(encodeData.toString('base64'), 'base64')
// );
// console.log('decode: ', decodeData.toString());

const ALL = 'all';
const STUDENT = 'student';
const TEACHER = 'teacher';
const ADMIN = 'admin';

module.exports = {
  mongoURI: 'mongodb://localhost/sysu-competition-system',
  tokenAlgorithm: 'RS256',
  rsaPublicKey, //公钥
  rsaPrivateKey, //私钥
  ALL,
  TEACHER,
  STUDENT,
  ADMIN,
};
