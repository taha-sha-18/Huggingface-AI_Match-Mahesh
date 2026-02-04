module.exports = {
  mongodb: {
    connectionString: 'mongodb://localhost:27017',
  },
  site: {
    baseUrl: '/',
    cookieKeyName: 'mongo-express',
    cookieSecret: 'temp-dev-secret',
    host: '0.0.0.0',
    port: 8081,
    requestSizeLimit: '50mb',
    sessionSecret: 'temp-dev-secret',
    sslEnabled: false,
  },
  useBasicAuth: false,
  basicAuth: {
    username: 'admin',
    password: 'pass',
  },
  options: {
    documentsPerPage: 10,
    editorTheme: 'rubyblue',
  },
};
