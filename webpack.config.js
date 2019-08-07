const fs = require('fs');
const path = require('path');
const values = require('lodash/values');
const ESLintPlugin = require('eslint-webpack-plugin');

const nodeEnvs = {
    DEVELOPMENT: 'development',
    PRODUCTION: 'production',
};

const webpackModes = {
    DEVELOPMENT: 'development',
    PRODUCTION: 'production',
};

const nodeEnv = values(nodeEnvs).indexOf(process.env.NODE_ENV) === -1 ? nodeEnvs.DEVELOPMENT : process.env.NODE_ENV;
const nodeEnvProd = nodeEnv === nodeEnvs.PRODUCTION;

const packageConfig = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
const packageName = packageConfig.name;

const projectIncludes = [
    path.resolve(__dirname, 'src/js'),
];

function getMode(nodeEnv) {
    switch (nodeEnv) {
        case nodeEnvs.PRODUCTION:
            return webpackModes.PRODUCTION;
        case nodeEnvs.DEVELOPMENT:
        default:
            return webpackModes.DEVELOPMENT;
    }
}

console.log('\n * Package Name: ', packageName); // eslint-disable-line no-console
console.log(' * Node Env: ', nodeEnv); // eslint-disable-line no-console
console.log(' * Webpack Mode: ', getMode(nodeEnv), '\n'); // eslint-disable-line no-console

const nodeBuildConfig = {
    entry: path.resolve(__dirname, 'src/js/index.ts'),
    mode: getMode(nodeEnv),
    module: {
        rules: [
            {
                test: /\.ts$/,
                include: [].concat(projectIncludes),
                use: [
                    {
                        loader: 'babel-loader',
                    },
                    {
                        loader: 'ts-loader',
                    }
                ],
            },
        ],
    },
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
    },
    performance: {
        hints: nodeEnvProd ? 'warning' : false,
    },
    plugins: [new ESLintPlugin({})],
    output: {
        filename: `${packageName}.min.js`,
        library: packageName,
        libraryTarget: 'umd',
        libraryExport: 'default',
        path: path.resolve(__dirname, 'build'),
    }
};

module.exports = nodeBuildConfig;
