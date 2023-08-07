import Controller from '../../core/base_controller';
const Mock = require('mockjs');

export default class TestController extends Controller {
  async index() {
    const { ctx } = this;
    const { id } = ctx.params;
    const { id: postId } = ctx.request.body;
    const idResult = await ctx.service.pbMock.api.searchById(id || postId);
    if (!idResult || idResult.length === 0) {
      this.error(-1113, '不存在的id');
      return;
    }

    const result = await ctx.service.pbMock.api.getJson(id);
    if (result) {
      try {
        ctx.type = 'json';
        ctx.body = Mock.mock(JSON.parse(result));
      } catch (error) {
        ctx.body = error.message || 'mock数据失败！'
      }
    } else {
      if (result.errCode) {
        this.error(result.errCode, result.errMsg);
        return;
      }
      this.error(-1111, 'json不存在！');
    }
  }

  async postIndex() {
    const { ctx } = this;
    const { id } = ctx.request.body;
    const idResult = await ctx.service.pbMock.api.searchById(id);
    if (!idResult || idResult.length === 0) {
      this.error(-1113, '不存在的id');
      return;
    }

    const result = await ctx.service.pbMock.api.getJson(id);
    if (result) {
      try {
        ctx.type = 'json';
        ctx.body = Mock.mock(JSON.parse(result));
      } catch (error) {
        ctx.body = error.message || 'mock数据失败！'
      }
    } else {
      if (result.errCode) {
        this.error(result.errCode, result.errMsg);
        return;
      }
      this.error(-1111, 'json不存在！');
    }
  }
}