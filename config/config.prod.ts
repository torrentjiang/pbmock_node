import { EggAppConfig, PowerPartial } from 'egg';

export default () => {
  const config: PowerPartial<EggAppConfig> = {
    cluster: {
      listen: {
        port: 7009
      },
    },
    mysql: {
      client: {
        host: '10.1.20.4',
        port: '3306',
        user: 'lab_rw',
        password: 'a2f8601350ecc4ac0f1cbb6fe9c2a449',
        database: 'pb_mock',
        // multipleStatements: true,
      },
      app: true,
      agent: false,
    },
    cors: {
      origin: '*',
      credentials: true,
      allowMethods: 'GET, HEAD, PUT, POST, DELETE, PATCH'
    },
    security: {
      csrf: {
        enable: false,
        headerName: 'x-csrf-token'
      }
    },
  };
  return config;
};
