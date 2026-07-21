module.exports = {
  apps: [
    {
      name: 'kalak-backend',
      cwd: __dirname,
      script: 'node_modules/.bin/tsx',
      args: 'src/index.mts',
      interpreter: 'none',
      env: {
        NODE_ENV: 'production',
      },
      max_memory_restart: '300M',
    },
  ],
}
