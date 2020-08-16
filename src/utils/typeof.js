// 判断是否是URL地址类型
function isURL(s) {
  return /^http[s]?:\/\/.*/.test(s);
}
// 判断是否是字符串类型
function isString(o) {
  return Object.prototype.toString.call(o).slice(8, -1) === 'String';
}
// 判断是否是数字类型
function isNumber(value) {
  return typeof value === 'number' || Object.prototype.toString.call(value) === '[object Number]';
}
// 判断是否是Boolean类型
function isBoolean(o) {
  return Object.prototype.toString.call(o).slice(8, -1) === 'Boolean';
}

/**
 *  判断是否是数组类型
 * */
function isArray(curObj) {
  let isArray = false;
  if (Object.prototype.toString.call(curObj).slice(8, -1) === 'Array') {
    isArray = true;
  }
  return isArray;
}

/**
 *  判断是否是对象类型
 * */
function isObject(curObj) {
  let isObject = false;
  if (Object.prototype.toString.call(curObj).slice(8, -1) === 'Object') {
    isObject = true;
  }
  return isObject;
}

/**
 *  判断是否是函数类型
 * */
function isFunction(curObj) {
  let isFunction = false;
  if (Object.prototype.toString.call(curObj).slice(8, -1) === 'Function') {
    isFunction = true;
  }
  return isFunction;
}

module.exports = {
  isURL,
  isString,
  isNumber,
  isBoolean,
  isArray,
  isObject,
  isFunction
};
