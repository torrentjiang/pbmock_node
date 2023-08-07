import Controller from '../../core/base_controller';

export default class GroupController extends Controller {
  public async add() {
    const { ctx } = this;
    const { teamId, groupName } = ctx.request.body;
    const teamIdInDatabase = await ctx.service.pbMock.team.search({ id: teamId });
    if (!teamIdInDatabase || teamIdInDatabase.length === 0) {
      this.error(-1,'不存在的teamId');
      return;
    }
    const groupTeamResult = await ctx.service.pbMock.group.add({ teamId, groupName });
    if (groupTeamResult && !groupTeamResult.errCode) {
      this.success();
    } else {
      this.error(groupTeamResult.errCode, groupTeamResult.errMsg);
    }
  }

  public async delete() {
    const { ctx } = this;
    const { groupId } = ctx.query;
    // 校验空
    if (!groupId) {
      this.error(-2,'groupId不能为空');
      return;
    }
    // 是否已存在
    const nameInDatabase = await ctx.service.pbMock.group.search({ id: groupId });
    if (!nameInDatabase || nameInDatabase.length === 0) {
      this.error(-3,'groupId不存在')
      return;
    }
    const result = await ctx.service.pbMock.group.delete(groupId);
    if (result && !result.errCode) {
      this.success();
    } else {
      this.error(result.errCode, result.errMsg);
    }
  }

  public async update() {
    const { ctx } = this;
    const { groupId, groupName } = ctx.request.body;
    // 校验空
    if (!groupId) {
      this.error(-4,'groupId不能为空');
      return;
    }
    if (!groupName) {
      this.error(-5,'groupName不能为空');
    }
    // 是否已存在
    const nameInDatabase = await ctx.service.pbMock.group.search({ id: groupId });
    if (!nameInDatabase || nameInDatabase.length === 0) {
      this.error(-6,'groupId不存在')
      return;
    }
    const result = await ctx.service.pbMock.group.update({ groupId, groupName });
    if (result && !result.errCode) {
      this.success();
    } else {
      this.error(result.errCode, result.errMsg);
    }
  }
}