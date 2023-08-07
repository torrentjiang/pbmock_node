import { Controller } from 'egg';

export default class BaseController extends Controller {
  success(data?: any) {
    this.ctx.body = {
      errCode: 0,
      data: data || null,
    };
  }

  error(errCode: number, errMsg?: string) {
    this.ctx.body = {
      errCode,
      errMsg: errMsg || '操作失败！',
    };
  }

  notFound(msg: string) {
    msg = msg || 'not found';
    this.ctx.throw(404, msg);
  }

  /**
   * 分页器逻辑
   * @param data 所有数据
   * @param page 当前页数
   * @param pageSize 单页条数
   */
  pagingHandler(data: any[], page: number, pageSize: number) {
    const total = data.length;
    const startRow = pageSize * (page - 1) + 1;
    let endRow = pageSize * page;

    endRow = endRow < total ? endRow : total;

    this.success({
      total,
      list: data.slice(startRow - 1, endRow),
    });

  }
}