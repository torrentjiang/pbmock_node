// This file is created by egg-ts-helper@1.25.8
// Do not modify this file!!!!!!!!!

import 'egg';
type AnyClass = new (...args: any[]) => any;
type AnyFunc<T = any> = (...args: any[]) => T;
type CanExportFunc = AnyFunc<Promise<any>> | AnyFunc<IterableIterator<any>>;
type AutoInstanceType<T, U = T extends CanExportFunc ? T : T extends AnyFunc ? ReturnType<T> : T> = U extends AnyClass ? InstanceType<U> : U;
import ExportTest from '../../../app/service/Test';
import ExportPbMockApi from '../../../app/service/pbMock/api';
import ExportPbMockGroup from '../../../app/service/pbMock/group';
import ExportPbMockProject from '../../../app/service/pbMock/project';
import ExportPbMockTeam from '../../../app/service/pbMock/team';

declare module 'egg' {
  interface IService {
    test: AutoInstanceType<typeof ExportTest>;
    pbMock: {
      api: AutoInstanceType<typeof ExportPbMockApi>;
      group: AutoInstanceType<typeof ExportPbMockGroup>;
      project: AutoInstanceType<typeof ExportPbMockProject>;
      team: AutoInstanceType<typeof ExportPbMockTeam>;
    }
  }
}
