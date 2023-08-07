import Service from '../../core/base_service';

interface updateParams {
  groupName: string;
  groupId: number;
}

interface teamGroupParams {
  teamId: number;
  groupId: number;
}

interface searchTeamParams {
  id?: number;
  name?: string;
}

interface addTeamParams {
  groupName: string;
  teamId: number;
}

export default class GroupService extends Service {

  static TABLE_NAME = 't_group'

  async add(req: addTeamParams) {
    const { groupName: name, teamId } = req;
    try {
      const result = await this.app.mysql.insert(GroupService.TABLE_NAME, { name });
      if (result.affectedRows !== 1) {
        return this.serviceFailed(-500506, '添加群组失败！');
      }
      const { insertId: groupId } = result;
      const teamGroupRes: any = await this.addTeamGroup({ groupId, teamId });
      if (teamGroupRes && !teamGroupRes.errCode) {
        return this.serviceSuccessed();
      } else {
        return this.serviceFailed(-1, '添加团队-群组关系失败！');
      }
    } catch (error) {
      this.logger.error(error);
      return this.serviceFailed(-500506, '添加数据库操作失败！');
    }
  }

  async delete(id: number) {
    try {
      const result = await this.app.mysql.update(GroupService.TABLE_NAME, { id, isDeleted: 1 });
      if (result.affectedRows === 1) {
        const teamGroupResult = await this.deleteTeamGroup('group_id', id);
        if (teamGroupResult && !teamGroupResult.errCode) {
          return await this.ctx.service.pbMock.project.deleteGroupProject('group_id', id);
        } else {
          return this.serviceFailed(teamGroupResult.errCode, teamGroupResult.errMsg);
        }
      } else {
        return this.serviceFailed(-12345, '删除群组失败！');
      }
    } catch (error) {
      this.logger.error(error);
      return this.serviceFailed(-500507, '删除失败！');
    }
  }

  async update(req: updateParams) {
    const { groupName: name, groupId: id } = req;
    const params = {
      id,
      name
    };
    this.deleteEmptyValues(params);
    try {
      const result = await this.app.mysql.update(GroupService.TABLE_NAME, params);
      if (result.affectedRows === 1) {
        return this.serviceSuccessed();
      } else {
        return this.serviceFailed(-12, '更新失败！');
      }
    } catch (error) {
      this.logger.error(error);
      return this.serviceFailed(-500508, '操作失败！');
    }
  }

  async addTeamGroup(req: teamGroupParams) {
    const { groupId: group_id, teamId: team_id } = req;
    const params = { group_id, team_id };
    try {
      const result = await this.app.mysql.insert('t_team_group', params);
      return result.affectedRows === 1;
    } catch (error) {
      this.logger.error(error);
      return this.serviceFailed(-500510, '添加团队-群组关系失败！');
    }
  }

  async search(req: searchTeamParams) {
    if (!req) {
      try {
        const result = await this.app.mysql.select(GroupService.TABLE_NAME, {
          where: { isDeleted: 0 }
        });
        return result;
      } catch (error) {
        this.logger.error(error);
        return this.serviceFailed(-500506, '查找群组失败！');
      }
    }
    const { id, name } = req;
    const params = { id, name, isDeleted: 0 };
    this.deleteEmptyValues(params);
    this.logger.info('search group param', params);
    try {
      return await this.app.mysql.select(GroupService.TABLE_NAME, { where: params });
    } catch (error) {
      this.logger.error(error);
      return this.serviceFailed(-500509, '获取群组集合失败！');
    }
  }

  async deleteTeamGroup(key, id) {
    try {
      const isExist = await this.app.mysql.get('t_team_group', {[key]: id})
      if (!isExist || isExist.length === 0) {
        return this.serviceSuccessed();
      }
      const relationResult = await this.app.mysql.query(`update t_team_group set isDeleted=1 where ${key}=${id}`);
      if (relationResult.affectedRows > 0) {
        return this.serviceSuccessed();
      } else {
        return this.serviceFailed(-1234, '团队-群组关系删除失败！');
      }
    } catch (error) {
      this.logger.error(error);
      return this.serviceFailed(-500509);
    }
  }
}