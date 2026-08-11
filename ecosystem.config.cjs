module.exports = {
  apps: [
    {
      name: 'nutri-track',
      script: './dist/server.cjs',
      env: {
        NODE_ENV: 'production',
        PORT: 3456
      }
    }
  ]
};
