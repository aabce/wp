'use strict';

module.exports.roundNumber = (number, digits = 2) => {
  let multiplicator = Math.pow(10, digits);
  number = parseFloat((number * multiplicator).toFixed(11));
  let test =(Math.round(number) / multiplicator);
  return +(test.toFixed(digits));
}
