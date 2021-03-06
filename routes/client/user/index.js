const { HttpException } = require('../../../utils/class');
const {
  rsaPublicKey,
  rsaPrivateKey,
  ALL,
  STUDENT,
  TEACHER,
  ADMIN,
} = require('../../../config/globalParams');
const { privateDecrypt } = require('crypto');
const { sign } = require('../../../utils/token');
const bcrypt = require('bcryptjs');
const router = require('koa-router')();
const User = require('../../../models/user');
const schema = require('./schema');
const { registerSchema, loginSchema, resetPwdSchema, idSchema } = schema;

router.prefix('/api/user');

/**
 * 登录接口
 */
router.post('/login', async (ctx, next) => {
  try {
    //数据校验
    const { error } = loginSchema.validate(ctx.request.body);
    if (error) {
      const Error = new HttpException('登录数据格式有误', 400);
      throw Error;
    }
    const { tel, password, verify } = ctx.request.body;
    console.log(verify);
    const user = await User.findOne({ tel });
    if (!user) {
      ctx.body = {
        code: 1,
        msg: '手机号还未注册',
        data: {},
      };
      return;
    }
    if (verify) {
      if (user.role !== ADMIN) {
        ctx.body = {
          code: 1,
          msg: '对不起,您不是管理员',
          data: {},
        };
        return;
      }
    }
    const buffer = Buffer.from(password, 'base64');
    const originalPassword = privateDecrypt(rsaPrivateKey, buffer).toString(); //解密后的原密码
    const flag = bcrypt.compareSync(originalPassword, user.password); // true
    if (flag) {
      let token =
        'Bearer ' +
        sign({
          name: user.name,
          id: user._id,
          role: user.role,
          tel: user.tel,
          staffId: user.staffId,
        });
      ctx.body = {
        code: 0,
        msg: '登录成功',
        data: {
          token,
          id: user.id,
          tel: user.tel,
          role: user.role,
          name: user.name,
          staffId: user.staffId,
        },
      };
    } else {
      ctx.body = {
        code: 1,
        msg: '密码错误',
        data: {},
      };
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
});

/**
 * 注册接口
 */
router.post('/register', async (ctx, next) => {
  try {
    // 数据校验;
    const { error } = registerSchema.validate(ctx.request.body);
    if (error) {
      const Error = new HttpException('注册数据格式有误', 400);
      throw Error;
    }
    const { tel, name, role, password, staffId } = ctx.request.body;

    const user = await User.findOne({ tel });
    if (user) {
      ctx.body = {
        code: 1,
        msg: '手机号已注册',
        data: {},
      };
    } else {
      //手机号未注册，则创建新用户
      const buffer = Buffer.from(password, 'base64');
      const originalPassword = privateDecrypt(rsaPrivateKey, buffer).toString(); //解密后的原密码
      const salt = bcrypt.genSaltSync(10);
      const hashPwd = bcrypt.hashSync(originalPassword, salt);
      const user = new User({
        tel,
        name,
        role,
        staffId,
        password: hashPwd,
      });
      const result = await user.save();
      let token =
        'Bearer ' +
        sign({
          name: user.name,
          id: user._id,
          role: user.role,
          tel: user.tel,
          staffId: user.staffId,
        });
      ctx.body = {
        code: 0,
        msg: '注册成功',
        data: {
          token,
          id: result._id,
          name: result.name,
          role: result.role,
          tel: result.tel,
          staffId: result.staffId,
        },
      };
    }
  } catch (error) {
    console.log('Register Route Error: ', error);
    throw error;
  }
});

/**
 * 获取所有用户名和职工号
 */
router.get('/userInfo/:role', async (ctx, next) => {
  try {
    const { role } = ctx.params;
    let result = [];
    if (role === ALL) {
      result = await User.find({}, 'staffId name'); //查找到所有的用户名
    } else if (role === TEACHER) {
      result = await User.find({ role: 'teacher' }, 'staffId name'); //查找到所有的用户名
    } else if (role === STUDENT) {
      result = await User.find({ role: 'student' }, 'staffId name'); //查找到所有的用户名
    }
    ctx.body = {
      code: 0,
      msg: '查找成功',
      data: result,
    };
  } catch (e) {
    throw e;
  }
});

/**
//  * 获取所有用户信息
//  */
router.get('/all/info', async (ctx, next) => {
  try {
    const result = await User.find({}); //查找到所有的用户名
    ctx.body = {
      code: 0,
      msg: '查找成功',
      data: result,
    };
  } catch (e) {
    throw e;
  }
});

/**
 * 获取公钥
 */
router.get('/key', async (ctx, next) => {
  try {
    ctx.body = {
      code: 0,
      msg: '公钥获取成功',
      data: {
        key: rsaPublicKey,
      },
    };
  } catch (e) {
    throw e;
  }
});

/**
 * 获取用户信息
 */
router.get('/get-info', async (ctx, next) => {
  try {
    ctx.body = {
      code: 0,
      msg: '用户信息获取成功',
      data: {
        ...ctx.state.user,
      },
    };
  } catch (e) {
    throw e;
  }
});

/**
 * 根据id查找用户
 */
router.post('/getUserInfoById', async (ctx, next) => {
  try {
    //数据校验
    const { error } = idSchema.validate(ctx.request.body);
    if (error) {
      const Error = new HttpException('请传入用户id', 400);
      throw Error;
    }
    const user = await User.findById(ctx.request.body.id);
    ctx.body = {
      code: 0,
      msg: '用户信息获取成功',
      data: {
        user,
      },
    };
  } catch (e) {
    throw e;
  }
});

/**
 * 客户端更新用户信息，重新签名
 */
router.post('/userUpdateInfo', async (ctx, next) => {
  try {
    const { error } = idSchema.validate(ctx.request.body);
    if (error) {
      const Error = new HttpException('请传入用户id', 400);
      throw Error;
    }
    const user = await User.findById(ctx.request.body.id);
    if (user) {
      user.name = ctx.request.body.name;
      user.tel = ctx.request.body.tel;
      user.role = ctx.request.body.role;
      if (ctx.request.body.password) {
        const buffer = Buffer.from(ctx.request.body.password, 'base64');
        const originalPassword = privateDecrypt(
          rsaPrivateKey,
          buffer
        ).toString(); //解密后的原密码
        const salt = bcrypt.genSaltSync(10);
        const hashPwd = bcrypt.hashSync(originalPassword, salt);
        user.password = hashPwd;
      }
      await user.save();
      let token =
        'Bearer ' +
        sign({
          name: user.name,
          id: user._id,
          role: user.role,
          tel: user.tel,
          staffId: user.staffId,
        });
      ctx.body = {
        code: 0,
        msg: '更新成功',
        data: {
          user,
          token,
        },
      };
    } else {
      ctx.body = {
        code: 1,
        msg: '用户不存在',
        data: {},
      };
    }
  } catch (e) {
    console.log(e);
    throw e;
  }
});

/**
 * 重置密码
 */
router.post('/resetPassword', async (ctx, next) => {
  try {
    // 数据校验;
    const { error } = resetPwdSchema.validate(ctx.request.body);
    if (error) {
      const Error = new HttpException('数据格式有误', 400);
      throw Error;
    }
    const { id, password, tel } = ctx.request.body;

    let user;
    if (id) {
      user = await User.findById(id);
    } else {
      user = await User.findOne({ tel });
    }
    if (!user) {
      ctx.body = {
        code: 1,
        msg: '该用户不存在',
        data: {},
      };
    } else {
      const buffer = Buffer.from(password, 'base64');
      const originalPassword = privateDecrypt(rsaPrivateKey, buffer).toString(); //解密后的原密码
      const salt = bcrypt.genSaltSync(10);
      const hashPwd = bcrypt.hashSync(originalPassword, salt);
      user.password = hashPwd;
      await user.save();
      ctx.body = {
        code: 0,
        msg: '密码修改成功',
        data: {},
      };
    }
  } catch (error) {
    throw error;
  }
});

/**
 * 获取用户报名的竞赛
 */
router.get('/getSignUpCompetition', async (ctx, next) => {
  try {
    const user = await User.findById(ctx.state.user.id).populate(
      'competitions.competition'
    );
    for (let i = 0; i < user.competitions.length; i++) {
      if (user.competitions[i].competition === null) {
        user.competitions.splice(i, 1);
      } else {
        let startTime = new Date(
          user.competitions[i].competition.start_time.replace('-', '/')
        );
        let endTime = new Date(
          user.competitions[i].competition.end_time.replace('-', '/')
        );
        let now = new Date(Date.now());
        //   console.log(startTime, endTime, now);
        if (now < startTime) {
          user.competitions[i].competition.status = 0; //未开始
        } else {
          if (now < endTime) {
            //   console.log('进行中');
            user.competitions[i].competition.status = 1; //进行中
          } else {
            user.competitions[i].competition.status = 2; //已结束
          }
        }
      }
    }
    ctx.body = {
      code: 0,
      msg: '查询成功',
      data: {
        signUpCompetition: user.competitions,
      },
    };
    user.save();
    // console.log(ctx.state);
  } catch (e) {
    console.log(e);
    throw e;
  }
});

module.exports = router;
