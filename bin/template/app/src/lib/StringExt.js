/**
 * Extended String methods
 */

class StringExt {

  constructor() {
    this._trimall();
    this._clean();
    this._beautify();
  }


  /**
   * Trim empty spaces from left and right and remove tab spaces inside text
   * @param string str - string to be modified
   * @return string - modified string is returned
   */
  _trimall() {
    Object.assign(String.prototype, {
      trimall() {
        let that = this;
        that = that.trim();
        that = that.replace(/\t\t+/g, ' ');
        that = that.replace(/\s\s+/g, ' ');
        that = that.replace(/\n\n+/g, '\n');
        that = that.replace(/\r\r+/g, '\r');
        that = that.replace(/\. /g, '.\r'); //new sentence in new line
        return this;
      }
    });
  }


  /**
   * Remove all whitespaces.
   * @param str - input string
   */
  _clean() {
    Object.assign(String.prototype, {
      clean() {
        let that = this;
        that = that.trim();
        that = that.replace(/\\s+/g, ' ');
        that = that.replace(/\\n+/g, '');
        that = that.replace(/\\r+/g, '');
        that = that.replace(/\\t+/g, '');
        return that;
      }
    });
  }


  /**
   * Clear text from unwanted characters
   * @param string str - string to be modified
   * @return string - modified string is returned
   */
  _beautify() {
    Object.assign(String.prototype, {
      beautify() {
        let that = this;
        that = that.replace(/_/g, ' ');
        that = that.replace(/:/g, '');
        that = that.replace(/\./g, '');
        return this;
      }
    });
  }


}


module.exports = StringExt; // CommonJS Modules
// export { StringExt }; // ES6 module
