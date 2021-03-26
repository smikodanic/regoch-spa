class Rand {

  /**
   * Generate random integer number between min and max number.
   * @param {number} min - 5000
   * @param {number} max - 8000
   * @returns {number}
   */
  integerBetween(min, max) {
    const diff = max - min;
    let rnd = min + diff * this.rnd1();
    rnd = Math.round(rnd);
    return rnd;
  }


  /**
   * Generate random float number between min and max number.
   * @param {number} min - 5.000
   * @param {number} max - 5.005
   * @param {number} dec - number of decimal places
   * @returns {number}
   */
  floatBetween(min, max, dec) {
    const diff = max - min;
    let rnd = min + (diff * this.rnd1());
    rnd = rnd.toFixed(dec);
    return rnd;
  }


  /**
   * Randomize (shuffle) JS Array.
   * @param  {any[]} arr     -array to be shuffled ['a', 12, 'b', 22, 'c', false]
   * @returns {any[]}         -shuffled array
   */
  shuffleArray(arr) {
    let i, j, temp;
    for (i = arr.length - 1; i > 0; i -= 1) {
      j = Math.floor(this.rnd1() * (i + 1));
      temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }
    return arr;
  }


  /**
   * JS randomizer 16 decimal places
   * @returns {number} - 0.8812394369218242
   */
  rnd1() {
    return Math.random();
  }

}

module.exports = Rand;
