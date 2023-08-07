import { EggAppConfig, PowerPartial } from 'egg';

const client = {
  host: 'localhost',
  port: '3306',
  user: 'root',
  password: '123456',
  database: 'pb_mock',
  // multipleStatements: true,
}

export default () => {
  const config: PowerPartial<EggAppConfig> = {
    cluster: {
      listen: {
        port: 7009
      },
    },
    mysql: {
      client,
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
