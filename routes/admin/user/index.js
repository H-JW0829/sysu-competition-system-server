const { rsaPrivateKey, ADMIN } = require('../../../config/globalParams');
const { privateDecrypt } = require('crypto');
const bcrypt = require('bcryptjs');
const router = require('koa-router')();
const User = require('../../../models/user');
router.prefix('/api/user');

/**
 * 更新用户信息
 */
router.post('/updateInfo', async (ctx, next) => {
  try {
    if (ctx.state.user.role !== ADMIN) {
      ctx.body = {
        code: -1,
        data: {},
        msg: '没有操作权限',
      };
      return;
    }
    const user = await User.findById(ctx.request.body._id);
    user.name = ctx.request.body.name;
    user.tel = ctx.request.body.tel;
    user.role = ctx.request.body.role;
    if (ctx.request.body.password) {
      const buffer = Buffer.from(ctx.request.body.password, 'base64');
      const originalPassword = privateDecrypt(rsaPrivateKey, buffer).toString(); //解密后的原密码
      const salt = bcrypt.genSaltSync(10);
      const hashPwd = bcrypt.hashSync(originalPassword, salt);
      user.password = hashPwd;
    }
    await user.save();
    ctx.body = {
      code: 0,
      msg: '更新成功',
      data: {
        user,
      },
    };
  } catch (e) {
    console.log(e);
    throw e;
  }
});

/**
 * 删除用户
 */
router.post('/delete', async (ctx, next) => {
  try {
    if (ctx.state.user.role !== ADMIN) {
      ctx.body = {
        code: -1,
        data: {},
        msg: '没有操作权限',
      };
      return;
    }
    const id = ctx.request.body.id;
    const result = await User.findByIdAndRemove(id);
    if (!result) {
      ctx.body = {
        code: 1,
        msg: '用户不存在',
        data: {},
      };
      return;
    }
    ctx.body = {
      code: 0,
      msg: '删除成功',
      data: {},
    };
  } catch (e) {
    console.log(e);
    throw e;
  }
});

/**
 * 增加用户
 */
router.post('/add', async (ctx, next) => {
  try {
    if (ctx.state.user.role !== ADMIN) {
      ctx.body = {
        code: -1,
        data: {},
        msg: '没有操作权限',
      };
      return;
    }
    const { tel, name, role, password, staffId } = ctx.request.body;
    const res = await User.findOne({ tel });
    if (res) {
      ctx.body = {
        code: 1,
        msg: '手机号已注册',
        data: {},
      };
      return;
    }
    const buffer = Buffer.from(password, 'base64');
    const originalPassword = privateDecrypt(rsaPrivateKey, buffer).toString(); //解密后的原密码
    const salt = bcrypt.genSaltSync(10);
    const hashPwd = bcrypt.hashSync(originalPassword, salt);
    const user = new User({
      name,
      tel,
      role,
      staffId,
      password: hashPwd,
    });
    await user.save();
    ctx.body = {
      code: 0,
      data: {
        user,
      },
      msg: '添加成功',
    };
  } catch (e) {
    console.log(e);
    throw e;
  }
});

module.exports = router;
