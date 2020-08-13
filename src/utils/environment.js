const isDevelopmentEnv = () => process.NODE_ENV === 'development';
const isProductionEnv = () => process.NODE_ENV === 'production';

module.exports = { isDevelopmentEnv, isProductionEnv };
