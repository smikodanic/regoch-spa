module.exports = (tip, text, color, background) => {
  const debugOpts = {
    // router.js
    router: false,

    // Controller.js
    renderDelay: false,
    rerender: false,
    scopeSetter: false,
    scopeGetter: false,
    scopeSet: false,
    scopeReset: false,

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
    rgEcho: false,
    rgPrint: false,
    rgValue: false,
    rgInterpolate: false,
    rgClass: false,
    rgStyle: false,
    rgLazyjs: false,

    // DataRgListeners.js
    rgKILL: false,
    rgHref: false,
    rgClick: false,
    rgKeyup: false,
    rgChange: false,
    rgEvt: false,
    rgSet: false,

    // Form.js
    setControl: false,
    setControls: false,
    getControl: false,
    getControls: false,
    delControl: false,
    delControls: false
  };

  if (debugOpts[tip]) { console.log(`%c ${text}`, `color: ${color}; background: ${background}`); }

  return debugOpts;
};
