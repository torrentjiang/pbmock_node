import Controller from '../../core/base_controller';

export default class TeamController extends Controller {
  public async add() {
    const { ctx } = this;
    const { teamName } = ctx.request.body;
    // 校验空
    if (!teamName) {
      this.error(-500, '群组名不能为空');
      return;
    }
    // 是否已存在
    const nameInDatabase = await ctx.service.pbMock.team.search({ name: teamName });
    // nameInDatabase = [] 未查询到该群组名
    if (nameInDatabase && nameInDatabase.length > 0) {
      this.error(-500, '群组名已存在')
      return;
    }
    const result = await ctx.service.pbMock.team.add({ teamName });
    if (result && !result.errCode) {
      this.success();
    } else {
      this.error(result.errCode, result.errMsg);
    }
  }

  public async delete() {
    const { ctx } = this;
    const { teamId } = ctx.query;
    // 校验空
    if (!teamId) {
      this.error(-500, 'teamId不能为空');
      return;
    }
    const id = +teamId || -1; // id 字符串转为数字
    // 是否已存在
    const nameInDatabase = await ctx.service.pbMock.team.search({id});
    if (!nameInDatabase || nameInDatabase.length === 0) {
      this.error(-500, 'teamId不存在')
      return;
    }
    const result = await ctx.service.pbMock.team.delete(id);
    if (result && !result.errCode) {
      this.success();
    } else {
      this.error(result.errCode, result.errMsg);
    }
  }

  public async update() {
    const { ctx } = this;
    const { teamId, teamName } = ctx.request.body;
    // 校验空
    if (!teamId) {
      this.error(-500, 'teamId不能为空');
      return;
    }
    if (!teamName) {
      this.error(-500, 'teamName不能为空');
    }
    // 是否已存在
    const nameInDatabase = await ctx.service.pbMock.team.search(teamId);
    if (!nameInDatabase) {
      this.error(-500, 'teamId不存在')
      return;
    }
    const result = await ctx.service.pbMock.team.update({ teamId, teamName });
    if (result && !result.errCode) {
      this.success();
    } else {
      this.error(result.errCode, result.errMsg);
    }
  }

  public async getTeamGroupList() {
    const { ctx } = this;
    const { size: pageSize = 10, current: page = 1, groupName, teamName } = ctx.query;
    const result = await ctx.service.pbMock.team.getGroupList({groupName, teamName});
    if (result && !result.errCode) {
      this.pagingHandler(result, page, pageSize);
    } else {
      this.error(result.errCode, result.errMsg);
    }
  }

  public async getTeam() {
    const { ctx } = this;
    const { id, name, size: pageSize = 10, current: page = 1 } = ctx.query;
    const teamList = await ctx.service.pbMock.team.search({ id, name });
    if (teamList && !teamList.errCode) {
      this.pagingHandler(teamList, page, pageSize);
    } else {
      this.error(-500, '获取团队列表失败！');
    }
  }
}
