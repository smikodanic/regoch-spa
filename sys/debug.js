module.exports = (tip, text, color, background) => {
  const debugOpts = {
    // Parse.js
    rgKILL: false,
    rgHref: false,
    rgClick: false,
    rgPrint: false,
    rgSet: false,
    rgIf: false,
    rgFor: true,

    // Load.js
    loadView: false,

    // Form.js
    setControl: false,
    getControl: false,
    delControl: false
  };

  if (debugOpts[tip]) { console.log(`%c ${text}`, `color: ${color}; background: ${background}`); }

  return debugOpts;
};
