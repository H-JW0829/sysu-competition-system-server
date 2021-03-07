const router = require('koa-router')();
const { ADMIN } = require('../../../config/globalParams');
const Competition = require('../../../models/competition');
const User = require('../../../models/user');

router.prefix('/api/competition');

/**
 * 创建比赛
 */
router.post('/add', async (ctx, next) => {
  try {
    //todo:数据校验
    if (ctx.state.user.role !== ADMIN) {
      ctx.body = {
        code: -1,
        data: {},
        msg: '没有操作权限',
      };
      return;
    }
    const {
      title,
      desc,
      organizer,
      content,
      team_num,
      start_time,
      end_time,
      tags,
      min_people,
      max_people,
      score_teacher,
    } = ctx.request.body;
    const competition = new Competition({
      title,
      desc,
      organizer,
      content,
      team_num: team_num ? team_num : 0,
      start_time,
      end_time,
      tags,
      min_people: Number(min_people),
      max_people: Number(max_people),
    });
    const teacher = await User.findOne({ staffId: score_teacher });
    competition.score_teacher = teacher._id;
    await competition.save();
    ctx.body = {
      code: 0,
      msg: '添加成功',
      data: {},
    };
  } catch (e) {
    console.log(e);
    throw e;
  }
});

/**
 * 删除比赛
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
    const result = await Competition.findByIdAndRemove(id);
    if (!result) {
      ctx.body = {
        code: 1,
        msg: '比赛不存在',
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
 * 更新比赛
 */
router.post('/update', async (ctx, next) => {
  try {
    if (ctx.state.user.role !== ADMIN) {
      ctx.body = {
        code: -1,
        data: {},
        msg: '没有操作权限',
      };
      return;
    }
    const updateCompetition = { ...ctx.request.body };
    const { id, score_teacher } = updateCompetition;
    updateCompetition.min_people = Number(updateCompetition.min_people);
    updateCompetition.max_people = Number(updateCompetition.max_people);
    const teacher = await User.findOne({ staffId: score_teacher });
    updateCompetition.score_teacher = teacher._id;
    const competition = await Competition.findByIdAndUpdate(
      id,
      {
        $set: {
          ...updateCompetition,
        },
      },
      { new: true }
    );
    // console.log(competition);
    ctx.body = {
      code: 0,
      msg: '更新成功',
      data: competition,
    };
  } catch (e) {
    console.log(e);
    throw e;
  }
});

/**
 * 更新比赛内容
 */
router.post('/updateContent', async (ctx, next) => {
  try {
    if (ctx.state.user.role !== ADMIN) {
      ctx.body = {
        code: -1,
        data: {},
        msg: '没有操作权限',
      };
      return;
    }
    const { content, id } = ctx.request.body;
    //   const { _id } = updateCompetition;
    const competition = await Competition.findById(id);
    competition.content = content;
    competition.save();
    ctx.body = {
      code: 0,
      msg: '更新成功',
      data: competition,
    };
  } catch (e) {
    throw e;
  }
});

/**
 * 发布成绩
 */
router.post('/publishRank', async (ctx, next) => {
  try {
    const { competitionId } = ctx.request.body;
    // const competition = await Competition.findById(competitionId);
    const competition = await Competition.findById(competitionId);
    competition.showRank = true;
    competition.save();
    ctx.body = {
      code: 0,
      data: {},
      msg: '发布成功',
    };
  } catch (e) {
    console.log(e);
    throw e;
  }
});

/**
 * 取消发布成绩
 */
router.post('/unPublishRank', async (ctx, next) => {
  try {
    const { competitionId } = ctx.request.body;
    // const competition = await Competition.findById(competitionId);
    const competition = await Competition.findById(competitionId);
    competition.showRank = false;
    competition.save();
    ctx.body = {
      code: 0,
      data: {},
      msg: '发布成功',
    };
  } catch (e) {
    console.log(e);
    throw e;
  }
});

/**
 * 取消所有的作品信息
 */
router.get('/getAllAppendixes', async (ctx, next) => {
  try {
    const populateQuery = [{ path: 'teams.users.user' }];
    const competitions = await Competition.find({}).populate(populateQuery); //找出所有的比赛
    const appendixes = [];
    let key = 0;
    for (let i = 0; i < competitions.length; i++) {
      if (competitions[i].teams.length > 0) {
        for (let j = 0; j < competitions[i].teams.length; j++) {
          const appendixInfo = {
            key: key++,
            team: {},
            competition: {},
            appendix: {},
          };
          appendixInfo.competition = {
            id: competitions[i]._id,
            title: competitions[i].title,
          };
          appendixInfo.appendix = competitions[i].teams[j].appendix;
          let temp = [];
          competitions[i].teams[j].users.map((item) => {
            temp.push(item.user.name);
          });
          appendixInfo.team.member = temp.join(' ');
          appendixInfo.team.id = competitions[i].teams[j]._id;
          appendixes.push(appendixInfo);
        }
      }
    }
    ctx.body = {
      code: 0,
      data: {
        appendixes,
      },
      msg: '查询成功',
    };
  } catch (e) {
    console.log(e);
    throw e;
  }
});

module.exports = router;
