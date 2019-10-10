'use strict';

module.exports.addMonthToDate = (date, month) => new Date(date.setMonth(date.getMonth() + month))