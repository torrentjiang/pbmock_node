import Service from '../../core/base_service';

interface addParams {
  teamName: string;
}

interface updatParams {
  teamName: string;
  teamId: number;
}

interface searchParams {
  id?: number;
  name?: string;
}

export default class TeamService extends Service {

  static TABLE_NAME = 't_team'

  static TEAM_GROUP = 't_team_group'

  async add(req: addParams) {
    const { teamName } = req;
    const params = {
      name: teamName || '',
      isDeleted: 0,
    };
    this.deleteEmptyValues(params);
    try {
      const result = await this.app.mysql.insert(TeamService.TABLE_NAME, params);
      if (result.affectedRows === 1) {
        return this.serviceSuccessed()
      } else {
        return this.serviceFailed(-500505, '添加失败！');
      }
    } catch (error) {
      this.logger.error(error);
      return this.serviceFailed(-500506, '添加团队失败！');
    }
  }

  async delete(id: number) {
    try {
      const result = await this.app.mysql.update(TeamService.TABLE_NAME, { id, isDeleted: 1 });

      if (result.affectedRows === 1) {
        const searchResult = await this.app.mysql.select(TeamService.TEAM_GROUP, {
          where: {
            team_id: id,
            isDeleted: 0
          }
        });
        // 删除关系
        if (searchResult.length !== 0) {
          return await this.ctx.service.pbMock.group.deleteTeamGroup('team_id', id);
          // this.logger.info('relationResult', relationResult);
          // if (relationResult.affectedRows === searchResult.length) {
          //   return this.serviceSuccessed();
          // } else {
          //   return this.serviceFailed(-100, '关系删除失败！');
          // }
        } else {
          return this.serviceSuccessed();
        }
      } else {
        return this.serviceFailed(-500, '删除失败！');
      }
    } catch (error) {
      this.logger.error(error);
      return this.serviceFailed(-500506, '删除群组失败！');
    }
  }

  async update(params: updatParams) {
    const { teamName: name, teamId: id } = params;
    try {
      const result = await this.app.mysql.update(TeamService.TABLE_NAME, { id, name });
      if (result.affectedRows === 1) {
        return this.serviceSuccessed();
      } else {
        return this.serviceFailed(-500, '更新失败！');
      }
    } catch (error) {
      this.logger.error(error);
      return this.serviceFailed(-500506, '更新群组信息失败！');
    }
  }

  async search(req?: searchParams) {
    if (!req) {
      try {
        const result = await this.app.mysql.select(TeamService.TABLE_NAME, {
          where: { isDeleted: 0 }
        });
        return result;
      } catch (error) {
        this.logger.error(error);
        return this.serviceFailed(-500506, '查找团队失败！');
      }
    }
    const { id, name = '' } = req;
    // const params = { id, name, isDeleted: 0 };
    // this.logger.info('search team param', params);
    try {
      const result = await this.app.mysql.query(`
        SELECT
          * 
        FROM
          ${TeamService.TABLE_NAME} 
        WHERE
          isDeleted = 0
          AND NAME LIKE '%${name}%' 
          ${id ? `AND id = ${id}` : ''}
      `)
      this.logger.info('search result', result);
      return result;
    } catch (error) {
      this.logger.error(error);
      return this.serviceFailed(-500, '查找团队失败！');
    }
  }

  async getGroupList(req?: any) {

    const { groupName, teamName } = req;
    try {
      const result = await this.app.mysql.query(`
      SELECT t_team.id as teamId,t_team.name as teamName,t_group.id as groupId,t_group.name as groupName
      FROM t_team_group
      JOIN t_group
      ON t_team_group.group_id=t_group.id
      JOIN t_team
      ON t_team_group.team_id=t_team.id
      WHERE t_team_group.isDeleted=0
      ${groupName ? ` and t_group.name like '%${groupName}%'` : ``}
      ${teamName ? ` and t_team.name like '%${teamName}%'` : ''}`);
      return result;
    } catch (error) {
      this.logger.error(error);
      return this.serviceFailed(-500, '获取群组-团队失败！');
    }
  }
}
