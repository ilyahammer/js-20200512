/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  if (size === undefined) return string;

  const arrOfStrings = string.split('');
  var iteration = 1;

  let result = arrOfStrings.filter( (item, index, array) => {
    iteration = array[index] === array[index - 1] ? ++iteration : 1;

    if (iteration <= size){
      return item;
    }
  });

  return result.join('');
}
