import { Service } from 'egg';

export default class BaseService extends Service {

  /**
   * 去掉对象中null或undefined的属性
   * @param obj 传入的json对象
   */
  deleteEmptyValues(obj: Object) {
    return Object.keys(obj).forEach((key: string) => (obj[key] == null || obj[key] == undefined) && delete obj[key]);
  }

  serviceSuccessed() {
    return {
      errCode: 0,
      errMsg: '',
    }
  }

  serviceFailed(errCode: number, errMsg?: string) {
    return {
      errCode,
      errMsg: errMsg || '操作失败！',
    }
  }
}
