module.exports = (tip, text, color, background) => {
  const debugOpts = {
    // Page.js
    loadInc: false,
    loadView: false,
    emptyView: false,
    loadHead: false,

    // DataRg.js
    rgFor: false,
    rgRepeat: false,
    rgIf: false,
    rgSwitch: false,
    rgElem: false,
    rgPrint: false,
    rgInterpolate: false,
    rgClass: false,
    rgStyle: false,

    // DataRgListeners.js
    rgKILL: false,
    rgHref: false,
    rgClick: false,
    rgChange: false,
    rgEvt: false,
    rgSet: false,

    // Form.js
    setControl: false,
    setControls: false,
    getControl: false,
    delControl: false
  };

  if (debugOpts[tip]) { console.log(`%c ${text}`, `color: ${color}; background: ${background}`); }

  return debugOpts;
};
