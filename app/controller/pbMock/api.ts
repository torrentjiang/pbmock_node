import Controller from '../../core/base_controller';

export default class ApiController extends Controller {
  async add() {
    const { ctx } = this;
    const { path, pbLink, desc, projectId, gatewayName: gateway, ts, json, apiName, noLink = 0 } = ctx.request.body;
    // 校验空
    if (!path) {
      this.error(-500600, 'path不能为空');
      return;
    }
    if (!pbLink && !noLink) {
      this.error(-500601, 'pbLink不能为空');
      return;
    }
    const result = await ctx.service.pbMock.api.add({ pbLink, path, desc, projectId, gateway, ts, json, apiName });
    if (result && !result.errCode) {
      this.success();
    } else {
      this.error(result.errCode, result.errMsg);
    }
  }

  async delete() {
    const { ctx } = this;
    const { apiId } = ctx.query;
    // 校验空
    if (!apiId) {
      this.error(-500602, 'apiId不能为空');
      return;
    }
    // 是否已存在
    const nameInDatabase = await ctx.service.pbMock.api.searchById(apiId);
    if (!nameInDatabase) {
      this.error(-500603, 'apiId不存在')
      return;
    }
    const result = await ctx.service.pbMock.api.delete({ id: apiId });
    if (result && !result.errCode) {
      this.success();
    } else {
      this.error(result.errCode, result.errMsg);
    }
  }

  async update() {
    const { ctx } = this;
    const { id, path, pbLink, desc, gatewayName: gateway, ts, json, projectId, apiName, noLink = 0 } = ctx.request.body;
    // 校验空
    if (!id) {
      this.error(-500604, 'apiId不能为空');
      return;
    }
    if (!pbLink && !noLink) {
      this.error(-500605, 'pbLink不能为空');
    }
    if (!path) {
      this.error(-500606, 'path不能为空');
    }
    // 是否已存在
    const apiInDatabase = await ctx.service.pbMock.api.searchById(id);
    if (!apiInDatabase) {
      this.error(-500607, 'apiId不存在')
      return;
    }
    const result = await ctx.service.pbMock.api.update({ id, path, pbLink, desc, gateway, ts, json, projectId, apiName });
    if (result && !result.errCode) {
      this.success();
    } else {
      this.error(result.errCode, result.errMsg);
    }
  }

  public async search() {
    const { ctx } = this;
    const { query } = ctx;
    const { projectId } = query;
    if (!projectId) {
      this.error(-500608, 'projectId不能为空');
      return;
    }
    const apiList = await ctx.service.pbMock.api.search(query);

    const { size: pageSize = 10, current: page = 1 } = query;

    const total = apiList.length;

    if (total < pageSize) {
      // 返回查询到的全部结果
      this.success({
        total,
        list: apiList,
      });

    } else {
      // 分页处理公共逻辑
      this.pagingHandler(apiList, page, pageSize);
    }
  }
}
