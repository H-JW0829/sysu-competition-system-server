const compose = require('koa-compose');

const clientCompetitionRoute = require('./client/competition');
const adminCompetitionRoute = require('./admin/competition');
const clientUserRoute = require('./client/user');
const adminUserRoute = require('./admin/user');

registerRouter = () => {
  let routers = [];
  routers.push(clientCompetitionRoute.routes());
  routers.push(clientCompetitionRoute.allowedMethods());

  routers.push(adminCompetitionRoute.routes());
  routers.push(adminCompetitionRoute.allowedMethods());

  routers.push(clientUserRoute.routes());
  routers.push(clientUserRoute.allowedMethods());

  routers.push(adminUserRoute.routes());
  routers.push(adminUserRoute.allowedMethods());

  return compose(routers);
};

module.exports = registerRouter;
