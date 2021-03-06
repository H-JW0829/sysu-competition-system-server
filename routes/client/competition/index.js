const router = require('koa-router')();
const mongoose = require('mongoose');
const { ADMIN } = require('../../../config/globalParams');
const Competition = require('../../../models/competition');
const User = require('../../../models/user');
const { compare } = require('../../../utils/methods');
const schema = require('./schema');
const { idSchema, signUpSchema } = schema;
const { HttpException } = require('../../../utils/class');

router.prefix('/api/competition');

/**
 * 获取比赛列表
 * 共用
 */
router.get('/all', async (ctx, next) => {
  try {
    const competitions = await Competition.find();
    let len = competitions.length;
    for (let i = 0; i < len; i++) {
      let startTime = new Date(competitions[i].start_time.replace('-', '/'));
      let endTime = new Date(competitions[i].end_time.replace('-', '/'));
      let now = new Date(Date.now());
      //   console.log(startTime, endTime, now);
      if (now < startTime) {
        competitions[i].status = 0; //未开始
      } else {
        if (now < endTime) {
          //   console.log('进行中');
          competitions[i].status = 1; //进行中
        } else {
          competitions[i].status = 2; //已结束
        }
      }
    }
    ctx.body = {
      code: 0,
      msg: '查询成功',
      data: {
        competitions,
      },
    };
  } catch (e) {
    console.log(e);
    throw e;
  }
});

/**
 * 查询比赛信息
 */
router.post('/find', async (ctx, next) => {
  try {
    //数据校验
    const { error } = idSchema.validate(ctx.request.body);
    if (error) {
      const Error = new HttpException('请传入比赛id', 400);
      throw Error;
    }
    const { competitionId } = ctx.request.body;
    try {
      let objectId = mongoose.Types.ObjectId(competitionId);
    } catch (e) {
      ctx.body = {
        code: 1,
        data: {},
        msg: '比赛id不正确',
      };
      return;
    }
    const populateQuery = [
      { path: 'teams.users.user' },
      { path: 'score_teacher', select: 'name role staffId tel' },
    ];
    const competition = await Competition.findById(competitionId).populate(
      populateQuery
    );
    if (!competition) {
      ctx.body = {
        code: 1,
        data: {},
        msg: '比赛id不存在',
      };
    } else {
      let startTime = new Date(competition.start_time.replace('-', '/'));
      let endTime = new Date(competition.end_time.replace('-', '/'));
      let now = new Date(Date.now());
      if (now < startTime) {
        competition.status = 0; //未开始
      } else {
        if (now < endTime) {
          //   console.log('进行中');
          competition.status = 1; //进行中
        } else {
          competition.status = 2; //已结束
        }
      }
      ctx.body = {
        code: 0,
        data: {
          competition,
        },
        msg: '查询成功',
      };
    }
  } catch (e) {
    console.log(e);
    throw e;
  }
});

/**
 * 报名参赛
 */
router.post('/signUp', async (ctx, next) => {
  try {
    //数据校验
    const { error } = signUpSchema.validate(ctx.request.body);
    if (error) {
      const Error = new HttpException('数据格式有误', 400);
      throw Error;
    }
    const data = ctx.request.body;
    const { users, competitionId } = data;
    console.log(users);
    const competition = await Competition.findById(competitionId);
    const appendix = {
      isSubmit: false,
    };
    const team = {
      _id: mongoose.Types.ObjectId(competition?.teams?.length),
      users: [],
      appendix,
      score: -1,
    };
    for (let i = 0; i < users.length; i++) {
      let signUpUser = {};
      const { isCaptain, staffId } = users[i];
      const user = await User.findOne({ staffId: staffId });
      const signUpCompetition = {
        competition: competition._id,
        isCaptain: isCaptain,
        teamId: team._id,
        appendix,
      };
      user.competitions.push(signUpCompetition);
      user.save();
      signUpUser.user = user._id;
      signUpUser.isCaptain = isCaptain;
      team.users.push(signUpUser);
    }
    competition.teams.push(team);
    competition.team_num += 1;
    competition.save();
    ctx.body = {
      code: 0,
      data: {
        competition,
      },
      msg: '报名成功',
    };
  } catch (e) {
    console.log(e);
    throw e;
  }
});

/**
 * 展示报名信息
 */
router.post('/listSignUp', async (ctx, next) => {
  try {
    //数据校验
    const { error } = idSchema.validate(ctx.request.body);
    if (error) {
      const Error = new HttpException('请传入比赛id', 400);
      throw Error;
    }
    const { competitionId } = ctx.request.body;
    const competition = await Competition.findById(competitionId).populate(
      'teams.users.user'
    );
    ctx.body = {
      code: 0,
      data: {
        competition,
      },
      msg: '查询成功',
    };
  } catch (e) {
    console.log(e);
    throw e;
  }
});

/**
 * 更新/提交作品
 */
router.post('/submitAppendix', async (ctx, next) => {
  try {
    //数据校验
    const { error } = idSchema.validate(ctx.request.body);
    if (error) {
      const Error = new HttpException('请传入比赛id', 400);
      throw Error;
    }
    const { competitionId, teamId, appendix } = ctx.request.body;
    const competition = await Competition.findById(competitionId);
    for (let i = 0; i < competition.teams.length; i++) {
      if (competition.teams[i]._id.toString() === teamId) {
        competition.teams[i].appendix = { ...appendix, isSubmit: true };
        break;
      }
    }
    competition.save();
    ctx.body = {
      code: 0,
      data: {},
      msg: '提交成功',
    };
  } catch (e) {
    console.log(e);
    throw e;
  }
});

/**
 * 获取作品
 */
router.post('/getAppendix', async (ctx, next) => {
  try {
    //数据校验
    const { error } = idSchema.validate(ctx.request.body);
    if (error) {
      const Error = new HttpException('请传入比赛id', 400);
      throw Error;
    }
    const { competitionId, teamId } = ctx.request.body;
    console.log(competitionId, teamId);
    const competition = await Competition.findById(competitionId);
    let appendix;
    for (let i = 0; i < competition.teams.length; i++) {
      if (competition.teams[i]._id.toString() === teamId) {
        appendix = { ...competition.teams[i].appendix };
        break;
      }
    }
    if (appendix.isSubmit) {
      ctx.body = {
        code: 0,
        data: {
          code: 0, //
          appendix,
        },
        msg: '查询成功',
      };
    } else {
      ctx.body = {
        code: 0,
        data: {
          code: 1, //
          appendix: {},
        },
        msg: '查询成功',
      };
    }
  } catch (e) {
    console.log(e);
    throw e;
  }
});

/**
 * 删除
 */
router.post('/deleteAppendix', async (ctx, next) => {
  try {
    //数据校验
    const { error } = idSchema.validate(ctx.request.body);
    if (error) {
      const Error = new HttpException('请传入比赛id', 400);
      throw Error;
    }
    const { competitionId, teamId } = ctx.request.body;
    const competition = await Competition.findById(competitionId);
    for (let i = 0; i < competition.teams.length; i++) {
      if (competition.teams[i]._id.toString() === teamId) {
        competition.teams[i].appendix = {};
        break;
      }
    }
    competition.save();
    ctx.body = {
      code: 0,
      data: {},
      msg: '删除成功',
    };
  } catch (e) {
    console.log(e);
    throw e;
  }
});

/**
 * 评分
 */
router.post('/submitScore', async (ctx, next) => {
  try {
    //数据校验
    const { error } = idSchema.validate(ctx.request.body);
    if (error) {
      const Error = new HttpException('请传入比赛id', 400);
      throw Error;
    }
    const { competitionId, teamId, score } = ctx.request.body;
    const competition = await Competition.findById(competitionId);
    for (let i = 0; i < competition.teams.length; i++) {
      if (competition.teams[i]._id.toString() === teamId) {
        competition.teams[i].score = Number(score);
        break;
      }
    }
    competition.save();
    ctx.body = {
      code: 0,
      data: {},
      msg: '评分成功',
    };
  } catch (e) {
    console.log(e);
    throw e;
  }
});

/**
 * 获取排名
 */
router.post('/getRank', async (ctx, next) => {
  try {
    //数据校验
    const { error } = idSchema.validate(ctx.request.body);
    if (error) {
      const Error = new HttpException('请传入比赛id', 400);
      throw Error;
    }
    const { competitionId } = ctx.request.body;
    // const competition = await Competition.findById(competitionId);
    const populateQuery = [{ path: 'teams.users.user' }];
    const competition = await Competition.findById(competitionId).populate(
      populateQuery
    );
    if (!competition.showRank) {
      ctx.body = {
        code: 1,
        data: {},
        msg: '成绩仍在统计中，请耐心等待',
      };
      return;
    }
    let rank = [];
    for (let i = 0; i < competition.teams.length; i++) {
      let row = { team: '', score: competition.teams[i].score };
      let temp = [];
      for (let j = 0; j < competition.teams[i].users.length; j++) {
        temp.push(competition.teams[i].users[j].user.name);
      }
      row.team = temp.join(' ');
      rank.push(row);
    }
    let result = rank.sort(compare('score'));
    let num = 1;
    for (let i = 0; i < result.length; i++) {
      if (i === 0) {
        result[i].rank = 1;
      } else {
        if (result[i].score === result[i - 1].score) {
          num += 1;
          result[i].rank = result[i - 1].rank;
        } else {
          result[i].rank = result[i - 1].rank + num;
          num = 1;
        }
      }
    }
    ctx.body = {
      code: 0,
      data: {
        rank,
      },
      msg: '查询成功',
    };
  } catch (e) {
    console.log(e);
    throw e;
  }
});

/**
 * 脚本
 */
router.get('/foot', async (ctx, next) => {
  try {
    // const { id } = ctx.request.body;
    const competitions = await Competition.find({});
    // console.log(competitions);
    for (let i = 0; i < competitions.length; i++) {
      for (let j = 0; j < competitions[i].teams.length; j++) {
        console.log('aaaa: ', competitions[i].teams[j]);
        console.log('before: ', typeof competitions[i].teams[j].isSubmit);
        delete competitions[i].teams[j].isSubmit;
        // console.log('after: ', competitions[i].teams[j].isSubmit);
      }
      competitions[i].save();
    }
  } catch (e) {
    console.log(e);
    throw e;
  }
});

module.exports = router;
