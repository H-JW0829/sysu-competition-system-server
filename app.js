const Koa = require('koa');
const app = new Koa();
const views = require('koa-views');
const json = require('koa-json');
const onerror = require('koa-onerror');
const bodyparser = require('koa-bodyparser');
const logger = require('koa-logger');
const middlewares = require('./middlewares');
const cors = require('koa2-cors');
const koa_jwt = require('koa-jwt');
const fs = require('fs');
const path = require('path');
const { verify } = require('./utils/token');
let key = fs.readFileSync(
  path.resolve(__dirname, './config/keys/rsa_token_public_key.pem')
); // get public key

const db = require('./models/database');

const user = require('./routes/client/user');
const competition = require('./routes/client/competition');

app.use(middlewares.catchGlobalError); //全局错误处理，一定要放在第一位
db.connect(); //连接数据库

// error handler
onerror(app);

// middlewares
app.use(
  bodyparser({
    enableTypes: ['json', 'form', 'text'],
  })
);
app.use(json());
app.use(logger());
app.use(require('koa-static')(__dirname + '/public'));
app.use(cors());

//配置模版引擎
app.use(
  views(__dirname + '/views', {
    extension: 'pug',
  })
);

// logger
app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  // console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

app.use(async (ctx, next) => {
  let token = ctx.headers.authorization;
  if (token == undefined) {
    await next();
  } else {
    const response = await verify(token);
    ctx.state.user = response;
    await next();
  }
});

app.use(async (ctx, next) => {
  return next().catch((err) => {
    if (err.status === 401) {
      ctx.status = 401;
      ctx.body = {
        code: 401,
        data: {},
        msg: '登录已过期，请重新登录',
      };
    } else {
      throw err;
    }
  });
});

//一定要放在路由前面！！！！！
app.use(
  koa_jwt({
    secret: key,
  }).unless({
    path: [
      '/api/user/login',
      '/api/user/register',
      '/api/user/key',
      '/api/user/userInfo/all',
      '/api/competition/foot',
    ], //除了这个地址，其他的URL都需要验证
  })
);
// routes
app.use(user.routes(), user.allowedMethods());
app.use(competition.routes(), competition.allowedMethods());

// error-handling
app.on('error', (err, ctx) => {
  // console.error('server error', err, ctx);
});

module.exports = app;
