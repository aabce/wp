'use strict';

module.exports.isArrayEmpty = array => array === undefined || array.length == 0 ? true : false;
module.exports.isObjectEmpty = object => object === null || !Object.keys(object).length ? true : false;