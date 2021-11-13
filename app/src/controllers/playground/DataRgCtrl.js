const { Controller, syslib } = require('../../../../sys');


class DataRgCtrl extends Controller {

  constructor(app) {
    super();
    this.debugOpts = {
      rgFor: false,
      rgChecked: false,
      rgPrint: false,
      rgPrintMustache: false
    };
  }

  async loader(trx) {
    this.setTitle('DataRg Test');
    this.unloadCSS(['/assets/css/theme.css']);
    this.addCSS(`
      .my-italic {
        font-style: italic;
      }
      .my-red {
        color: red;
      }
      .my-font-size {
        font-size: 21px;
      }
    `, '#myCSS');
    await this.loadView('#primary', 'playground/datarg/primary.html', 'inner');
  }

  async init(trx) {
    // initial values for the runFOR example
    this.limit = 3;
    this.skip = 2;
    this.companies = [
      { name: 'Cloud Ltd', size: 3 },
      { name: 'Roto Ltd', size: 5 },
      { name: 'Zen Ltd', size: 8 },
      { name: 'Den Ltd', size: 9 },
      { name: 'Len Ltd', size: 10 },
      { name: 'Pen Ltd', size: 81 },
      { name: 'Gen Ltd', size: 82 },
      { name: 'Ren Ltd', size: 83 }
    ];

    // initial values for runFOR2
    this.herbals = [];

    // initial for runFORnested
    this.fields = ['name', 'from', 'to', 'duration'];
    this.trains = [
      { name: 'TRAIN-A', from: 'DU', to: 'ST', duration: 55 },
      { name: 'TRAIN-B', from: 'ST', to: 'KN', duration: 66 }
    ];

    // initial value for runREPEAT
    this.multiplikator = 3;

    // initial values for the runSWITCH example
    this.myColor = 'green';

    // initail value for data-rg-print with the pipe
    this.longText = 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard.';

    // text with the HTML
    this.htmlText = 'The best <b style="color:red">man</b> friend is: <i data-rg-if="bestFriend $not()">NOBODY</i> <i data-rg-if="bestFriend $eq(Dog)">DOG</i>';

    // initial value for the data-rg-bind
    this.bander = { name: 'Smokie', animal: 'horse', article: 'Lorem ipsumus ...' };

    // initial value for the data-rg-checked
    this.checks1 = ['Tin'];
  }


  // if rend() is not used then default render() is executed
  // async rend() {
  //   this.renderGens();
  //   await syslib.util.sleep(10);
  //   this.renderNonGens();
  //   await syslib.util.sleep(10);
  //   await this.renderLsns();
  // }






  /*********** GENERATORS **********/

  // show array elements by using data-rg-for
  async runFOR() {
    this.companies = [
      { name: 'Cloud2 Ltd', size: 3 },
      { name: 'Roto2 Ltd', size: 5 },
      { name: 'Zen2 Ltd', size: 8 },
      { name: 'Den2 Ltd', size: 81 },
      { name: 'Len2 Ltd', size: 82 },
      { name: 'Pen2 Ltd', size: 83 },
      { name: 'Gen2 Ltd', size: 84 },
      { name: 'Ren2 Ltd', size: 855 }
    ];
    this.rgFor('companies');
    this.rgPrint('companies');
  }

  // show array elements by using data-rg-for
  async runFOR2() {
    this.skipNum = 10;
    this.herbals = ['corn', 'banana', 'plum', 'straw'];
    this.render('herbals');
  }


  // run data-rg-for inside data-rg-for
  async runFORnested() {
    this.fields = ['name', 'from', 'to', 'duration'];
    this.trains = [
      { name: 'TRAIN1', from: 'OS', to: 'NA', duration: 2 },
      { name: 'TRAIN2', from: 'OS', to: 'ZG', duration: 3 },
      { name: 'TRAIN3', from: 'SB', to: 'VK', duration: 5 }
    ];
    this.renders(['fields', 'trains']); // data-rg-for will be rendered by defined order i.e. first 'fields' and then 'trains'
    // this.render(); // data-rg-for will be rendered by the priority number
  }

  // repeat the data-rg-repeat num times
  async runREPEAT(num) {
    this.multiplikator = num;
    this.render('multiplikator');
  }


  // print initial value and after 1300ms the modified value
  async runPRINT() {
    this.product = {
      name: 'Toyota',
      address: {
        city: 'London'
      },
      colors: ['red', 'green']
    };
    this.rgPrint('product'); // affect data-rg-print with the product

    await syslib.util.sleep(1300);
    console.log('Product properties changed!');

    this.product.address.city = 'Zagreb';
    this.rgPrint('product.address.city');  // affect only data-rg-print with the product.address.city

    this.product.colors = ['blue', 'orange'];
    this.rgPrint('product.colors');  // affect only data-rg-print with the product.colors
  }


  printHTML() {
    this.bestFriend = 'Dog';
    this.rgIf('bestFriend');
  }


  mustacheDO() {
    // mustache test
    this.mustVar1 = 'Lorem ipsum dolor net morea';
    this.mustVar2 = { txt: 'Lorem ipsum <b style="color:aqua">dolor net</b> morea' };
    this.rgPrint('mustVar1');
    this.rgPrint('mustVar2');
  }





  /*********** NON-GENERATORS **********/

  // toggle text color by using data-rg-elem
  runELEM() {
    this.toggle = !this.toggle;
    if (this.toggle) {
      this.rgelems.myElem.style.color = 'blue';
    } else {
      this.rgelems.myElem.style.color = 'silver';
    }
  }

  // toggle if and show hide elements
  toggleIF() {
    this.ifX = !this.ifX;
    console.log('toggleIF::', this.ifX);
    this.rgIf('ifX');
  }

  runIF() {
    this.myNum = 5;
    this.myStr = 'some str';
    this.myArr = [5, 4, 'lorem'];

    this.ifY = {
      bool: true,
      num: 5,
      str: 'some str'
    };
    console.log('runIF::', this.ifY);
    this.rgIf('ifY');
  }

  async toggleIF2() {
    this.continent = !!this.continent ? '' : 'Europe';
    this.render('continent');
  }


  // Here are two tests. First will show only one switchcase when red, blue, green is typed in the input field. Another test will show multiple switchcases.
  runSWITCH() {
    this.obj = { myColors: ['green2', 'blue2'] };
    this.rgSwitch('myColor'); // this.myColor
    this.rgSwitch('obj.myColors @@ multiple'); // this.obj.myColors
  }

  // add CSS classes 'my-red' and 'my-font-size' to the element data-rg-class="myKlases"
  runCLASS() {
    this.myKlases = ['my-red', 'my-font-size'];
    this.rgClass('myKlases');
  }

  // add style attribute values
  runSTYLE(fontSize, color) {
    this.myStajl = { fontSize, color };
    this.rgStyle('myStajl');
  }

  // define image src attribute
  runSRC() {
    this.imageURL = 'http://cdn.dex8.com/img/turnkey_tasks/scraper_free.png';
    this.rgSrc('imageURL');
  }


  runRERENDER() {
    console.log('runRERENDER::', this.bander);
    this.render('bander');
  }


  toggleDISABLED() {
    this.isDisabled = !this.isDisabled;
    this.render('isDisabled');
  }


  setVALUES() {
    this.input_text01 = 'some text';
    this.input_text_undefined;
    this.input_text_obj = { a: 22 };
    this.input_numberAsString = '157';
    this.input_text01 = 'some text';
    this.rgValue('input_');
  }


  setCHECKED() {
    this.checks1 = ['Pin', 'Tin'];
    this.rgChecked('checks1');
  }

}


module.exports = DataRgCtrl;
