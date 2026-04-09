import esbuildPluginTsc from 'esbuild-plugin-tsc';

export default () => ({
  bundle: true,
  minify: true,
  sourcemap: false,
  external: ['@aws-sdk/*'],
  plugins: [esbuildPluginTsc()],
});
