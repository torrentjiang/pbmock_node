import { Application } from 'egg';

export default (app: Application) => {
  const { controller, router } = app;
  const { others, pbMock } = controller;
  const { project, team, group, api } = pbMock;
  const { test } = others;
  const host = '/feInnerNode'

  router.get(`/mock/:id`, test.index);
  router.post(`/mock`, test.postIndex);
  router.get(`${host}/getTeamGroupList`, team.getTeamGroupList);
  router.post(`${host}/addTeam`, team.add);
  router.delete(`${host}/deleteTeam`, team.delete);
  router.put(`${host}/updateTeam`, team.update);
  router.get(`${host}/getTeam`, team.getTeam);
  
  router.post(`${host}/addGroup`, group.add);
  router.delete(`${host}/deleteGroup`, group.delete);
  router.put(`${host}/updateGroup`, group.update);

  router.get(`${host}/searchProject`, project.search);
  router.post(`${host}/addProject`, project.add);
  router.delete(`${host}/deleteProject`, project.delete);
  router.put(`${host}/updateProject`, project.update);

  router.get(`${host}/searchApi`, api.search);
  router.post(`${host}/addApi`, api.add);
  router.delete(`${host}/deleteApi`, api.delete);
  router.put(`${host}/updateApi`, api.update);
};
