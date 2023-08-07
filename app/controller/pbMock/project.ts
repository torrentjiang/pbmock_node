import Controller from '../../core/base_controller';

export default class ProjectController extends Controller {
  public async add() {
    const { ctx } = this;
    const { projectName, groupId } = ctx.request.body;
    // 校验空
    if (!projectName) {
      this.error(-500500, 'projectName不能为空');
      return;
    }
    // 项目名是否已存在
    // const nameInDatabase = await ctx.service.pbMock.project.search({ name: projectName });
    // if (nameInDatabase && nameInDatabase.length > 0) {
    //   this.error(-500501);
    //   return;
    // }
    const result = await ctx.service.pbMock.project.add({ projectName, groupId });
    if (result && !result.errCode) {
      this.success();
    } else {
      this.error(-500502);
    }
  }

  public async delete() {
    const { ctx } = this;
    const { projectId } = ctx.query;
    // 校验空
    if (!projectId) {
      this.error(-500503, 'projectId不能为空');
      return;
    }
    const result = await ctx.service.pbMock.project.delete(projectId);
    if (result && !result.errCode) {
      this.success();
    } else {
      this.error(result.errCode, result.errMsg);
    }
  }

  public async update() {
    const { ctx } = this;
    const { projectId, gatewayName, projectName } = ctx.request.body;
    // 校验空
    if (!projectId) {
      return this.error(-500503, 'projectId不能为空');
    }
    if (!projectName) {
      return this.error(-500500, 'projectName不能为空');

    }
    const result = await ctx.service.pbMock.project.update({ gatewayName, projectId, projectName });
    if (result && result.errCode) {
      return this.success();
    } else {
      this.error(result.errCode, result.errMsg);
    }
  }

  public async search() {
    const { ctx } = this;
    const { query } = ctx;
    const { projectName, gatewayName, size: pageSize = 10, current: page = 1, groupId } = query;
    const result = await this.ctx.service.pbMock.project.search({ name: projectName, gatewayName, groupId });
    if (result && !result.errCode) {
      // 处理数据结构
      const newRes: any[] = [];
      result.forEach(i => {
        if (!newRes.some(j => j.id === i.id)) {
          newRes.push(i);
          return;
        }
        newRes.map(k => {
          if (k.id === i.id) {
            k.gateway += `,${i.gateway}`
          }
          return k;
        })
      })

      this.pagingHandler(newRes, page, pageSize);
    } else {
      this.error(result.errCode, result.errMsg);
    }
  }
}