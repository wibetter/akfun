// https://www.npmjs.com/package/autoprefixer

module.exports = {
  plugins: [
    require('autoprefixer')({
      overrideBrowserslist: [
        '> 1%',
        'last 2 versions',
        'not ie <= 8',
        'iOS >= 8',
        'Firefox >= 20',
        'Android > 4.4'
      ]
    })
  ]
};
