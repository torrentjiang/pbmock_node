import Service from '../../core/base_service';

interface updateParams {
  gatewayName?: string;
  projectId: number;
  projectName: string;
}

interface searchProjectParams {
  id?: number;
  name?: string;
  gatewayName?: string;
  groupId?: number;
}

interface addProjectParams {
  projectName: string;
  groupId: number;
}

export default class ProjectService extends Service {

  static TABLE_NAME = 't_project';

  async add(req: addProjectParams) {
    const { groupId, projectName: name } = req;
    try {
      const result = await this.app.mysql.insert(ProjectService.TABLE_NAME, { name });
      if (result.affectedRows === 1) {
        const relationResult = await this.app.mysql.insert('t_group_project', { group_id: groupId, project_id: result.insertId })
        if (relationResult.affectedRows === 1) {
          return this.serviceSuccessed();
        } else {
          return this.serviceFailed(-500511, '添加群组-项目关系失败！');
        }
      } else {
        return this.serviceFailed(-500511, '添加项目失败！');
      }
    } catch (error) {
      this.logger.error(error);
      return this.serviceFailed(-500511, '添加项目失败！');
    }
  }

  async delete(id: number) {
    try {
      const resultById = await this.app.mysql.get(ProjectService.TABLE_NAME, { id });
      if (!resultById || resultById.length === 0) {
        return this.serviceFailed(-500513, '不存在该项目！');
      }
      if (resultById.isDeleted === 1) {
        return this.serviceFailed(-500514, '数据已删除！');
      }
      const result = await this.app.mysql.update(ProjectService.TABLE_NAME, { id, isDeleted: 1 });
      if (result.affectedRows === 1) {
        return await this.deleteGroupProject('project_id', id);
      } else {
        return this.serviceFailed(-500512, '数据删除失败！');
      }
    } catch (error) {
      this.logger.error(error);
      return this.serviceFailed(-500512, '删除项目失败！');
    }
  }

  async update(req: updateParams) {
    const { gatewayName, projectId: id, projectName: name } = req;
    const params = {
      id,
      name,
      gatewayName
    }
    this.deleteEmptyValues(params);
    try {
      const resultById = await this.app.mysql.get(ProjectService.TABLE_NAME, { id });
      if (!resultById) {
        return this.serviceFailed(-500513, '不存在该项目！');
      }
      if (resultById.isDeleted === 1) {
        return this.serviceFailed(-500513, '数据已删除！');
      }
      const result = await this.app.mysql.update(ProjectService.TABLE_NAME, params);
      if (result.affectedRows === 1) {
        return this.serviceSuccessed();
      } else {
        return this.serviceFailed(-500513, '更新失败！')
      }
    } catch (error) {
      this.logger.error(error);
      return this.serviceFailed(-500513, '更新项目失败！');
    }
  }

  async search(req: searchProjectParams) {
    const { id, name, gatewayName, groupId } = req;
    const parmas = { id, name, gatewayName, groupId, isDeleted: 0 };
    this.deleteEmptyValues(parmas);
    try {
      return await this.app.mysql.query(`
      SELECT
        t_project.id,
        t_project.name,
        module,
        api.gateway
      FROM
        t_group_project
        LEFT JOIN t_project ON t_project.id = t_group_project.project_id
        LEFT JOIN (
        SELECT
          t_api.id,
          t_api.gateway
        FROM
          t_project_api
          LEFT JOIN t_api ON t_api.id = t_project_api.api_id 
        WHERE
          t_api.isDeleted = 0 
          AND t_project_api.isDeleted = 0 
          ) api ON t_group_project.project_id = api.id
        WHERE
          t_project.isDeleted = 0 
          AND t_group_project.isDeleted = 0
            ${id ? ` AND t_project.id = '${id}'` : ``} 
            ${name ? ` AND t_project.name like '%${name}%'` : ``} 
            ${groupId ? ` AND t_group_project.group_id = '${groupId}'` : ``}
        `);
    } catch (error) {
      this.logger.error(error);
      return this.serviceFailed(-500514, '查找项目失败！');
    }
  }

  async deleteGroupProject(key: string, id: number) {
    try {
      const result = await this.app.mysql.get('t_group_project', { [key]: id });
      if (!result || result.length === 0) {
        return this.serviceSuccessed();
      }
      const relationResult = await this.app.mysql.query(`update t_group_project set isDeleted=1 where ${key}=${id}`)
      if (relationResult.affectedRows > 0) {
        return this.serviceSuccessed();
      } else {
        return this.serviceFailed(-10, '删除群组-项目关系失败！');
      }
    } catch (error) {
      this.logger.error(error);
      return this.serviceFailed(-500514, '删除群组-项目关系失败！');
    }
  }
}