// This file is created by egg-ts-helper@1.25.8
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportOthersTest from '../../../app/controller/others/test';
import ExportPbMockApi from '../../../app/controller/pbMock/api';
import ExportPbMockGroup from '../../../app/controller/pbMock/group';
import ExportPbMockProject from '../../../app/controller/pbMock/project';
import ExportPbMockTeam from '../../../app/controller/pbMock/team';

declare module 'egg' {
  interface IController {
    others: {
      test: ExportOthersTest;
    }
    pbMock: {
      api: ExportPbMockApi;
      group: ExportPbMockGroup;
      project: ExportPbMockProject;
      team: ExportPbMockTeam;
    }
  }
}
