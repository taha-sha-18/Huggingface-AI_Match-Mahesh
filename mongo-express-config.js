module.exports = {
  mongodb: {
    connectionString: 'mongodb://localhost:27017',
    admin: true,
  },
  site: {
    baseUrl: '/api/db-admin',
    cookieKeyName: 'mongo-express',
    cookieSecret: 'mongo-express-emergent-secret-2025',
    host: '0.0.0.0',
    port: 8081,
    requestSizeLimit: '50mb',
    sessionSecret: 'mongo-express-emergent-session-2025',
    sslEnabled: false,
  },
  useBasicAuth: false,
  basicAuth: {
    username: 'admin',
    password: 'pass',
  },
  options: {
    documentsPerPage: 20,
    editorTheme: 'rubyblue',
    readOnly: false,
    noExport: false,
    noDelete: false,
    confirmDelete: true,
    collapsibleJSON: true,
    collapsibleJSONDefaultUnfold: 1,
  },
};
