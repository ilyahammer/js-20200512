/**
 * Sum - returns sum of arguments if they can be converted to a number
 * @param {number} n value
 * @returns {number | function}
 */
export function sum (n) {

  function nextIteration(b) {
    n += b;
    return nextIteration;
  };

  nextIteration.toString = () => n || 0;
  return nextIteration;
}
