const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  chainWebpack: (config) => {
    config.output
      .filename('[name].[contenthash].js')
      .chunkFilename('[name].[contenthash].js');
  },
  devServer: {
    port: 8081  // Cambia 8081 por el puerto que desees
  },
});
