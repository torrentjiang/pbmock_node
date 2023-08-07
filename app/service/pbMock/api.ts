import Service from '../../core/base_service';
import { isBoolean } from 'util';

interface apiParams {
  pbLink: string;
  path: string;
  projectId: number;
  gateway: string,
  desc: string;
  id?: number;
  ts?: string;
  json?: string;
  apiName?: string;
}

interface updateParams {
  id: number;
  pbLink: string;
  path: string;
  desc?: string;
  gateway?: string;
  ts?: string;
  json?: string;
  projectId: number;
  apiName?: string;
}

interface searchApiReq {
  projectId: number;
  apiPath?: string;
  gatewayName?: string;
  pbLink?: string;
}

interface projectApiParams {
  apiId: number;
  projectId: number;
}

interface projectGatewayParams {
  api_id: number;
  project_id: number;
  gateway_name: string;
}

export default class ApiService extends Service {

  static TABLE_NAME = 't_api';

  /**
   * 前端获取api列表 返回所有查询结果，在controller层完成分页
   */
  async search(req: searchApiReq) {

    const { apiPath, gatewayName, pbLink, projectId } = req;

    // 转换属性名
    const param = {
      path: apiPath,
      gateway: gatewayName,
      pb_link: pbLink,
      isDeleted: 0,
      project_id: projectId
    };

    this.deleteEmptyValues(param);

    try {
      const apiList: any = await this.app.mysql.query(`
      SELECT
        t_api.id,
        path,
        t_api.desc,
        api_name as apiName,
        gateway,
        pb_link as pbLink,
        json,
        ts 
      FROM
        t_api
        JOIN t_project_api ON t_api.id = t_project_api.api_id
      WHERE
        t_api.isDeleted = 0 
        AND t_project_api.isDeleted = 0
        AND t_project_api.project_id = ${projectId}
        ${apiPath ? `AND t_api.path like '%${apiPath}%'` : ''}
        ${pbLink ? `AND t_api.pb_link like '%${pbLink}%'` : ''}
        ${gatewayName ? `AND t_api.gateway like '%${gatewayName}%'` : ''}
      `);
      return apiList;
    } catch (error) {
      this.logger.error(error);
      return this.serviceFailed(-500506, '查找失败');
    }

  }

  /**
   * 新增api
   */
  async add(req: apiParams) {
    const { id, desc, pbLink, path, projectId, gateway, ts, json, apiName } = req;

    if (id) {
      return this.update(req as updateParams);
    } else {
      const param = {
        desc,
        pb_link: pbLink,
        path: path,
        gateway: gateway,
        ts,
        json,
        api_name: apiName,
      };
      this.deleteEmptyValues(param);
      try {
        const result = await this.app.mysql.insert(ApiService.TABLE_NAME, param);
        console.log('add result', result);
        const { insertId: apiId } = result;
        if (!apiId) {
          return this.serviceFailed(-501003, '新增失败！');
        }
        const projectApiRes = await this.addProjectApi({ projectId, apiId });
        if (projectApiRes && isBoolean(projectApiRes)) {
          if (!gateway) {
            return this.serviceSuccessed();
          }
          return await this.addProjectGateway({
            project_id: projectId,
            gateway_name: gateway,
            api_id: apiId
          })
        } else {
          return this.serviceFailed(-501004, '新增失败');
        }
      } catch (error) {
        this.logger.error(error);
        return this.serviceFailed(-501005, '新增失败！');
      }
    }
  }

  /**
   * 编辑api
   */
  async update(req: updateParams) {
    const { id, desc, pbLink, path, gateway, ts, json, projectId, apiName } = req;
    if (!id) {
      return this.serviceFailed(-501001, '缺少api id!');
    }
    try {
      const data = await this.app.mysql.get(ApiService.TABLE_NAME, { id });
      this.logger.info(data);
      // 数据已删除
      if (data.isDeleted === 1) {
        return this.serviceFailed(-501004, '不存在该api！');
      }
      const param = {
        id: id,
        desc: desc,
        pb_link: pbLink,
        path: path,
        ts,
        json,
        api_name: apiName,
      };
      this.deleteEmptyValues(param);
      const result = await this.app.mysql.update(ApiService.TABLE_NAME, param);
      const updateSuccess = result.affectedRows === 1;
      if (updateSuccess) {
        if (!gateway) {
          return this.serviceSuccessed();
        }
        const projectGatewayParam = {
          project_id: projectId,
          gateway_name: gateway,
          api_id: id
        }
        if (!projectGatewayParam.project_id) {
          const project = await this.app.mysql.query(`
            select project_id from t_project_api where api_id = ${id}
          `);
          project.length === 1 && (projectGatewayParam.project_id = project[0].project_id);
        }
        return await this.addProjectGateway(projectGatewayParam)
      } else {
        return this.serviceFailed(-501002, '更新失败！');
      }
    } catch (error) {
      this.logger.error(error);
      return this.serviceFailed(-501002, '更新失败！');
    }
  }

  /**
   * 删除api
   */
  async delete(req: { id: number }) {
    try {
      const result = await this.app.mysql.get(ApiService.TABLE_NAME, req);
      this.logger.info(result);
      if (result.isDeleted === 1) {
        return this.serviceFailed(-501007, '该数据已删除');
      } else {
        const deleteResult = await this.app.mysql.update(ApiService.TABLE_NAME, Object.assign({ isDeleted: 1 }, req));
        this.logger.info(deleteResult);
        const deleteSuccess = deleteResult.affectedRows === 1;
        if (deleteSuccess) {
          return this.serviceSuccessed();
        } else {
          return this.serviceFailed(-501003, '删除失败！');
        }
      }
    } catch (error) {
      this.logger.error(error);
      return this.serviceFailed(-501003, '删除失败！');
    }
  }

  async searchByName(name: string) {
    try {
      const result = await this.app.mysql.get(ApiService.TABLE_NAME, { name });
      return result;
    } catch (error) {
      this.logger.error(error);
      return this.serviceFailed(-501003, '操作异常！');
    }
  }

  async searchById(id: number) {
    try {
      const result = await this.app.mysql.get(ApiService.TABLE_NAME, { id });
      console.log('result', result)
      return result;
    } catch (error) {
      this.logger.error(error);
      return this.serviceFailed(-501003, '操作异常！');
    }
  }

  async addProjectApi(req: projectApiParams) {
    const { projectId: project_id, apiId: api_id } = req;
    try {
      const result = await this.app.mysql.insert('t_project_api', { project_id, api_id });
      return result.affectedRows === 1;
    } catch (error) {
      this.logger.error(error);
      return this.serviceFailed(-501003, '操作异常！');
    }
  }

  async addProjectGateway(params: projectGatewayParams) {
    const projectGatewayRes = await this.app.mysql.insert('t_project_gateway', params);
    if (projectGatewayRes.affectedRows === 1) {
      return this.serviceSuccessed();
    } else {
      return this.serviceFailed(-501008, '新增项目-网关关系失败');
    }
  }

  async getJson(id: number) {
    try {
      const data = await this.app.mysql.query(`
        SELECT
          json 
        FROM
          ${ApiService.TABLE_NAME} 
        WHERE
          isDeleted = 0 
          AND id = '${id}'
      `);
      return data && data[0].json || '';
    } catch (error) {
      this.logger.error(error);
      return this.serviceFailed(-1000, '获取json失败！');
    }
  }
}