const Encore = require('@symfony/webpack-encore');

// Manually configure the runtime environment if not already configured yet by the "encore" command.
// It's useful when you use tools that rely on webpack.config.js file.
if (!Encore.isRuntimeEnvironmentConfigured()) {
    Encore.configureRuntimeEnvironment(process.env.NODE_ENV || 'dev');
}

Encore
    .setOutputPath('public/build/')
    .setPublicPath('/build')
    .addEntry('app', './assets/app.js')
    .addAliases({
        '@': `${__dirname}/assets`,
    })
    .splitEntryChunks()
    .enableSingleRuntimeChunk()
    .cleanupOutputBeforeBuild()
    .enableBuildNotifications()
    .enableSourceMaps(!Encore.isProduction())
    .enableVersioning(Encore.isProduction())
    .enableSassLoader()
    .enableVueLoader(() => {}, {
        runtimeCompilerBuild: false,
        useJsx: true
    })//*/
    .configureBabelPresetEnv((config) => {
        config.useBuiltIns = 'usage';
        config.corejs = '3.23';
    })
    .configureDevServerOptions(options => {
        options.allowedHosts = 'all';
        options.firewall = false;
        options.liveReload = true;
        //options.static = {watch: false};
        //options.watchFiles = {paths: ['src/**/*.php', 'templates/**/*'],};
    })
    //.enableTypeScriptLoader()
;

module.exports = Encore.getWebpackConfig();
