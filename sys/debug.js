module.exports = (tip, text, color, background) => {
  const debugOpts = {
    // RGparser.js
    rgKILL: false,
    rgHref: false,
    rgClick: false,
    rgChange: false,
    rgEvt: false,
    rgSet: false,

    rgPrint: false,
    rgClass: false,
    rgStyle: false,
    rgIf: false,
    rgSwitch: false,
    rgFor: false,
    rgRepeat: false,
    rgElem: false,

    // View.js
    loadView: false,
    emptyView: false,
    rgInc: true,

    // Form.js
    setControl: false,
    getControl: false,
    delControl: false
  };

  if (debugOpts[tip]) { console.log(`%c ${text}`, `color: ${color}; background: ${background}`); }

  return debugOpts;
};
