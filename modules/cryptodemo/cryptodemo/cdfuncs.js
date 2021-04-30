var alpha = "abcdefghijklmnopqrstuvwxyz";
//var mixMapString = "anbocpdqerfsgthuivjwkxlymz";
//var mixMapString = "qerfsgthuivjwkxlymzanbocpd";

var mixMapString = "dveuftgshriqjpkolnmzaybxcw";
// cut in half, reverse n-z, interleave z-n and a-m, cut after 7th "card"
// This seems to work well.  My original "mix" worked in that each encryption
// function was distinct, but didn't work in that there were pairs of keys
// that produced nearly identical encryptions ... close enough that you could
// guess the plaintext even though you got the wrong key!  This doesn't appear
// to have that problem ... though I haven't verified carefully.
// NOTE: I verified that up to keylength four all functions are distinct.
// Also, for n=2 the closest pair of keys have 12 chars in common.  Am I
// OK with that?

var engLetFreq = [
  8.167, 1.492, 2.782, 4.253, 12.702, 2.228, 2.015, 6.094, 6.966, 0.153, 0.772,
  4.025, 2.406, 6.749, 7.507, 1.929, 0.095, 5.987, 6.327, 9.056, 2.758, 0.978,
  2.360, 0.150, 1.974, 0.074
];

// Given string c (assumed to consist of a single character)
// returns [base,offset] where
// if c is not alphabetical, base is char code of c and offset = -1
// otherwise base is code of 'a' or 'A' and offset is distance from base
var baseoffset = function(c) {
  let k = c.charCodeAt(0);
  if (97 <= k && k <= 122) return [97, k - 97];
  else if (65 <= k && k <= 90) return [65, k - 65];
  else return [k, -1];
};

// produce HTML version of str with <br>'s inserted after width chars
let addLineBreaks = function(str, width) {
  let A = [];
  let i = 0;
  let ss = str.substr(i, width);
  while (ss != "") {
    A.push(ss);
    i += width;
    ss = str.substr(i, width);
  }
  return A.join("<br>");
}

// Note: obj and elt may be the same
let addVisibilitySetter = function(obj, elt) {
    obj.setVis = function(onoff) {
      if (elt.style == undefined) { elt.style={};}
    elt.style.display = onoff == "off" ? "none" : "";
  }
  return obj;
};

var myshiftleft = function(str, key) {
  let d = Number(key);
  if (isNaN(d)) {
    let k = key.charCodeAt(0);
    if (97 <= k && k <= 122) d = k - 97;
    else if (65 <= k && k <= 90) d = k - 65;
    else
      throw 'shift amount key must be letter a-z, received ' + key;
  }
  let N = str.length;
  let delta = N - (d % N);
  let s = Array.from(str);
  for (let start = 0, count = N; count > 0; start++) {
    let from = start,
      to = start + delta;
    let buff = s[start];
    while (to != start) {
      {
        let tmp = buff;
        buff = s[to];
        s[to] = tmp;
      } //swap(buff, s[to]);
      from = to;
      to = (to + delta) % N;
      count--;
    }
    s[to] = buff;
    count--;
  }
  return s.join('');
}

var createCTile = function(letter) {
  let tile = document.createElement("DIV");
  tile.className = "ctile";
  tile.appendChild(document.createTextNode(letter));
  return tile;

}

// ChapMap is an interface/baseclass
var createCharMap = function(initialMap = alpha) {
  let dims = [42, null];
  let ntab = document.createElement("TABLE");
  ntab.style.height = dims[0] + "px";
  ntab.className = "cmap";
  let nrow = ntab.insertRow();
  let brow = ntab.insertRow();
  for (let i = 0; i < alpha.length; i++) {
    let cell = nrow.insertCell();
    cell.appendChild(document.createTextNode(alpha[i]));
    brow.insertCell().appendChild(createCTile(alpha[i]));
  }
  let mapString = alpha;
  let revMapString = null;

  let mapChangeListeners = [];
  let addMapChangeListener = function(callback) {
    mapChangeListeners.push(callback);
  }
  let setMapString = function(s, dontUpdateGUI = false) {
    if (!dontUpdateGUI) {
      // this version shuffles the CTiles around w/o relabelling
      let tmp = new Array(26).fill(null);
      for (let i = 0; i < 26; i++) {
        let cell = ntab.rows[1].cells[i].firstChild;
        cell = ntab.rows[1].cells[i].removeChild(cell);
        let k = Number(cell.innerText.charCodeAt(0) - 97);
        tmp[k] = cell;
      }
      for (let i = 0; i < 26; i++) {
        let index = s.charCodeAt(i) - 97;
        ntab.rows[1].cells[i].appendChild(tmp[index]);
      }
    }
    mapString = s;
    revMapString = null;
    for (let f of mapChangeListeners) {
      f();
    }
  };

  let leftshift = function(amt) {
    setMapString(myshiftleft(mapString, amt));
  };
  let map = function(c, ms) {
    if (c == "") {
      return c;
    }
    let bo = baseoffset(c);
    if (bo[1] == -1) return c;
    let d = ms[bo[1]];
    if (d == 63) {
      return "?";
    }
    return bo[0] == 97 ? d : d.toUpperCase();
  };
  let stringmap = function(strorig, ms) {
    let str = typeof(strorig) == "string" ? strorig : "";
    let A = str.split("");
    for (let i = 0; i < str.length; i++)
      A[i] = map(A[i], ms);
    return A.join("");
  }
  let fwdmap = function(c) {
    return stringmap(c, mapString);
  }
  let revmap = function(c) {
    if (c == "") return c;
    if (revMapString == null) {
      let A = Array.from(mapString);
      for (let i = 0; i < mapString.length; i++) {
        A[i] = "?";
      }
      for (let i = 0; i < mapString.length; i++) {
        let k = mapString.charCodeAt(i);
        if (k != 63) // 63 = ?
          A[k - 97] = String.fromCharCode(i + 97);
      }
      revMapString = A.join('');
    }
    //console.log("revmap: " + revMapString)
    return stringmap(c, revMapString); //map(c, revMapString);
  }
  setMapString(initialMap);
  return {
    'element': ntab,
    'getMapString': () => mapString,
    'setMapString': setMapString,
    'leftshift': leftshift,
    'addMapChangeListener': addMapChangeListener,
    'map': fwdmap,
    'unmap': revmap,
    'ntab': ntab, // should only be accessed if you really need it!
    'getDims': (() => dims),
  };
};

var createIncompleteCharMap = function() {
  let cmap = createCharMap(alpha);

    function allowDrop(ev) {
	console.log(ev.toElement.tagName);
	if (ev.toElement.tagName == "TD" && ev.toElement.childElementCount == 0)
	    ev.preventDefault();
    }

  function drag(ev) {
    let tile = ev.srcElement;
    for (let i = 1; i < 3; i++)
      for (let j = 0; j < 26; j++) {
        if (cmap.ntab.rows[i].cells[j].childElementCount > 0 &&
          cmap.ntab.rows[i].cells[j].firstChild == tile) {
          ev.dataTransfer.setData("text", JSON.stringify([i, j]));
          return;
        }
      }
  }

  function drop(ev) {
    ev.preventDefault();
    var data = JSON.parse(ev.dataTransfer.getData("text"));
    ev.target.appendChild(cmap.ntab.rows[data[0]].cells[data[1]].firstChild);
    let A = [];
    for (let j = 0; j < 26; j++) {
      let cell = cmap.ntab.rows[1].cells[j];
      A.push(cell.childElementCount == 0 ? "?" : cell.firstChild.innerText);
    }
    origsetString(A.join(""), true);
  }

  let origsetString = cmap.setMapString;
  let row = cmap.ntab.insertRow();
  for (let i = 0; i < 26; i++) {
    let cell = row.insertCell();
    cell.style.borderStyle = "none";
    let cell1 = cmap.ntab.rows[1].cells[i];
    let tile = cell1.firstChild;
    cell1.removeChild(tile);
    cell.appendChild(tile);
    tile.draggable = "true";
    cell1.addEventListener('dragover', allowDrop);
    cell.addEventListener('dragover', allowDrop);
    cell1.addEventListener('drop', drop);
    cell.addEventListener('drop', drop);
    cell1.addEventListener('dragstart', drag);
    cell.addEventListener('dragstart', drag);
  }
  let setMapStringALT = function(s) {  // Figure out what's going on here!
    return;
    let A = alpha.split("");
    for (let i = 0; i < 26; i++) {
      if (s[i] != "?") {
        cmap.ntab.rows[1].cells[i].firstChild.innerText = s[i];
        A[baseoffset(s[i])[1]] = "";
      }
    }
    for (let i = 0; i < 26; i++) {
      let cell = cmap.ntab.rows[2].cells[i];
      if (cell.childElementCount != 0) {
        let x = cell.firstChild.innerText;
        let i = baseoffset(x)[1];
        if (A[i] == "") {
          cmap.ntab.rows[2].removeChild(cell);
        } else {
          A[i] = "";
        }
      }
    }
    for (let i = 0; i < 26; i++) {
      let k = 0;
      while (A[k] == "") k++;
      let cell = cmap.ntab.rows[2].cells[i];
      if (cell.childElementCount == 0) {

      }
    }
    origsetString(s, true);
  };
  //setMapStringALT("??????????????????????????");
  origsetString("??????????????????????????", true);
  //console.log(cmap.ntab.rows[1].cells[0].firstChild);
  cmap.setMapString = setMapStringALT;

  function setCharAt(str, index, chr) {
    if (index > str.length - 1) return str;
    return str.substring(0, index) + chr + str.substring(index + 1);
  }
  let ctileToIndexMap = {};
  for (let i = 0; i < 26; i++) {
    let ctile = cmap.ntab.rows[1].cells[i].firstChild
    //console.log(ctile);
    let assignValue = function(e) {
      setMapStringALT(setCharAt(cmap.getMapString(), i, prompt("enter char")));
    }
    //ctile.addEventListener('click', assignValue);
  }
  cmap.getDims = () => [68, null];

  return cmap;
}


var createCharMapCtrl = function() {
  let ctab = document.createElement("TABLE");
  ctab.className = "cmapc";
  let r1 = ctab.insertRow();
  let c = r1.insertCell();
  c.colSpan = "2";
  c.appendChild(document.createTextNode("shift"));
  let r2 = ctab.insertRow();
  r2.insertCell().appendChild(document.createTextNode("0"));
  r2.insertCell().appendChild(document.createTextNode("a"));
  return ctab;
}

var createCharMapLabel = function(extraRow=false) {
  let ctab = document.createElement("TABLE");
  ctab.className = "cmapx";
  let r1 = ctab.insertRow();
  r1.insertCell().appendChild(document.createTextNode(" plain"));
  let r2 = ctab.insertRow();
  r2.insertCell().appendChild(document.createTextNode("cipher"));
  if (extraRow) {
    let r3 = ctab.insertRow();
    r3.insertCell().appendChild(document.createTextNode(""));
  }
  return ctab;
}

var createShiftButtons = function(func1, func2) {
  let ctab = document.createElement("TABLE");
  ctab.className = "cmapx";
  let r1 = ctab.insertRow();
  let t1 = createCTile("+");
  t1.onclick = func1;
  t1.ondblclick = function(e) {
    e.stopPropagation();
  }
  r1.insertCell().appendChild(t1);
  let r2 = ctab.insertRow();
  let t2 = createCTile("-");
  t2.onclick = func2;
  t2.ondblclick = function(e) {
    e.stopPropagation();
  }
  r2.insertCell().appendChild(t2);
  return ctab;
}

var createCharMapShift = function() {
  let tab = document.createElement("TABLE");
  let row = tab.insertRow();
  let charMapLabel = createCharMapLabel();
  let charMap = createCharMap();
  let charMapCtrl = createCharMapCtrl();
  row.insertCell().appendChild(charMapLabel);
  row.insertCell().appendChild(charMap.element);
  row.insertCell().appendChild(charMapCtrl);

  let shiftValue = 0;
  let mapChangeListeners = [];
  let addMapChangeListener = function(callback) {
    mapChangeListeners.push(callback);
  }
  let updateShiftValue = function(newVal) {
    let delta = newVal - shiftValue;
    shiftValue = newVal;
    charMapCtrl.rows[1].cells[0].innerText = String(shiftValue);
    charMapCtrl.rows[1].cells[1].innerText = alpha[shiftValue];
    for (let f of mapChangeListeners) {
      f();
    }
  }
  let fwdShift = function() {
    charMap.leftshift(1);
    updateShiftValue((shiftValue + 1) % 26);
  }
  let revShift = function() {
    charMap.leftshift(25);
    updateShiftValue((shiftValue + 25) % 26);
  };
  let shiftButtons = createShiftButtons(fwdShift, revShift);
  row.insertCell().appendChild(shiftButtons);
  let cms = {
    "element": tab,
    "map": charMap.map, //((c) => charMap.map(c)),//cmMap(charMap, c)),
    "unmap": charMap.unmap, //((c) => charMap.unmap(c)),//cmUnmap(charMap, c)),
    "addMapChangeListener": addMapChangeListener,
    "getMapString": charMap.getMapString,
    "setMapString": ((x) => {
      throw "Cannot call setMapString on CharMapShift"
    }),
    'getDims': charMap.getDims,
    //"getCharMap": (() => charMap),
  };
  return cms;
}

var createShiftFunctionBox = function() {
  var map1 = createCharMapShift();
  let dims = [map1.getDims()[0] + 6, 620]; // dims: array of [height,width] in px
  let currDims = [...dims];
  let fb = document.createElement("div");
  fb.className = "funbox";
  fb.style.height = dims[0] + "px";
  fb.style.width = dims[1] + "px";
  fb.appendChild(map1.element);
  let getMap = () => map1;
  let setPosition = function(left, top) { //-- strings with units!
    fb.style.left = left;
    fb.style.top = top;
  };
  let origWidth = -1;
  let isCollapsed = false;
  let collapse = function() {
    map1.element.style.display = "none";
    origWidth = fb.style.width;
    fb.style.width = '48px';
    currDims[1] = 48;
    isCollapsed = true;
  };
  let expand = function() {
    map1.element.style.display = "";
    fb.style.width = origWidth;
    currDims[1] = dims[1];
    isCollapsed = false;
  };
  return {
    'element': fb,
    'getMap': getMap,
    'setPosition': setPosition,
    'collapse': collapse,
    'expand': expand,
    'isCollapsed': (() => isCollapsed),
    'getDims': (() => currDims),
  };
}

var createCharBox = function() {
  let value = "";


  let cb = document.createElement("div");
  cb.contentEditable="true";
  cb.className = "charbox";
  //cb.value = value;
  let getValue = () => value;
  let updateListeners = [];
  let addUpdateListener = function(callback) {
    updateListeners.push(callback);
  }
  let set = function(letter) {
    if (value != letter) {
      //value = cb.value = letter;
      cb.innerText=value=letter;
      for (let f of updateListeners) {
        f(value);
      }
    }
  }
  let updateFromKey = function(e) {
    //console.log("beforeinput: " + e.data);
    //cb.value = ""; // then the letter gets tacked on to empty string
    cb.innerText = e.data;
    value = e.data;
    for (let f of updateListeners) {
      f(value);
    }
  };
  cb.addEventListener('input', updateFromKey);

  let focusListeners = [];
  let addFocusListener = function(callback) {
    focusListeners.push(callback);
  }
  cb.addEventListener('focus', (e) => {
    //console.log("focus: " + e.data);
    for (let f of focusListeners) {
      f(e);
    }
  });

  let setPosition = function(left, top) { //-- strings with units!
    cb.style.left = left;
    cb.style.top = top;
  }
  let cbx = {
    "element": cb,
    "set": set,
    "addUpdateListener": addUpdateListener,
    "addFocusListener": addFocusListener,
    "setPosition": setPosition,
    "getValue": getValue,
  };
  return cbx;
}

var createSimpleLabel = function(str) {
  let elt = document.createElement("div");
  elt.className = "baseLabel";
  elt.innerHTML = str;
  let setPosition = function(left, top) { //-- strings with units!
    elt.style.left = left;
    elt.style.top = top;
  }
  return { "element": elt, "setPosition": setPosition};
};

var createTextareaBox = function() {
  let dims = [84, 680]; // was 48
  let value = "";

  let cb = document.createElement("textarea");
  cb.className = "textareabox";
  cb.value = value;
  cb.height = dims[0] + "px";

  let set = function(letter) {
    if (value == letter) return;
    value = cb.value = letter;
    for (let f of valSetListeners) {
      f(value);
    }
  }


  let valSetListeners = [];
  let addValSetListener = function(callback) {
    valSetListeners.push(callback);
  };
  let getValue = () => value;
  let updateListeners = [];
  let addUpdateListener = function(callback) {
    updateListeners.push(callback);
  };
  let updateFromGUI = function(e) {
    set(cb.value);
    for (let f of updateListeners) {
      f(value);
    }
  };
  cb.addEventListener('input', updateFromGUI);
  cb.addEventListener('keyup', updateFromGUI);

  let focusListeners = [];
  let addFocusListener = function(callback) {
    focusListeners.push(callback);
  }
  cb.addEventListener('focus', (e) => {
    for (let f of focusListeners) {
      f(e);
    }
  });

  let setPosition = function(left, top) { //-- strings with units!
    cb.style.left = left;
    cb.style.top = top;
  }
  let cbx = {
    "element": cb,
    "set": set,
    "addUpdateListener": addUpdateListener,
    "addFocusListener": addFocusListener,
    "addValSetListener": addValSetListener,
    "setPosition": setPosition,
    "getValue": getValue,
    "getDims": (x) => dims,

  };
  return cbx;
}

var createArrow = function(coords, noarrow = false) {
  let svgns = "http://www.w3.org/2000/svg";
  let svg = document.createElementNS(svgns, "svg");
  svg.setAttribute('xmlns', svgns);
  svg.setAttribute('height', "300px");
  svg.setAttribute('width', "1200px");

  let aLen = 12;
  let aHalfHeight = 6;
  let pl = document.createElementNS(svgns, "polyline");
  pl.setAttribute('style', "stroke:gray; stroke-width:3; fill:none;");
  let points = "";
  let i = 0;
  for (; i < coords.length - 2; i += 2) {
    points = points + coords[i] + "," + coords[i + 1] + " ";
  }
  points = points + (coords[i] - (noarrow ? 0 : aLen)) + "," + (coords[i + 1]);
  pl.setAttribute('points', points);
  svg.appendChild(pl);
  if (!noarrow) {
    let pg = document.createElementNS(svgns, "polygon");
    pg.setAttribute('style', "fill:gray;");
    let x = coords[i];
    let y = coords[i + 1];
    pg.setAttribute('points', x + "," + y + " " +
      (x - aLen) + "," + (y + aHalfHeight) + " " +
      (x - aLen) + "," + (y - aHalfHeight));
    svg.appendChild(pg);
  }
  let pard = document.createElement("div");
  pard.className = "svgcontainer";
  pard.style.zIndex = "-1";
  pard.appendChild(svg);
  let setPosition = function(left, top) {
    svg.style.left = left + "px";
    svg.style.top = top + "px";
  }
  return {
    "element": pard,
    "setPosition": setPosition,
  };
}

var setPosition = function(obj, p) {
  obj.setPosition(p[0] + "px", p[1] + "px");
};
var applySetPosition = setPosition;
let tr = function(p, L) {
  for (let i = 0; i < L.length; i++) L[i] += p[i % 2];
  return L;
};

var createSingleCharMapView = function(funcBox,showFreq=true) {
  let view = document.createElement("div");
  view.style = "position: relative; border: 3px solid #73AD21; height: 200px;";

  let ori = [10, funcBox.getDims()[0] / 2];
  var arr1 = createArrow(tr(ori, [25, 76, 100, 76]));
  view.appendChild(arr1.element);
  var arr2 = createArrow(tr(ori, [734, 76, 809, 76]));
  var arr2c = createArrow(tr(ori, [162, 76, 237, 76]));
  view.appendChild(arr2.element);

  // Char boxes
  var cbin = createCharBox();
  setPosition(cbin, tr(ori, [6, 64]));
  view.appendChild(cbin.element);
  var cbout = createCharBox();
  setPosition(cbout, tr(ori, [808, 64]));
  view.appendChild(cbout.element);
  var lastEditedPlainchar = true;
  //cbin.addUpdateListener((x) => (lastEditedPlainchar = true));
  cbin.addFocusListener((x) => (lastEditedPlainchar = true));
  //cbout.addUpdateListener((x) => (lastEditedPlainchar = false));
  cbout.addFocusListener((x) => (lastEditedPlainchar = false));

  // Text areas
  var tain = createTextareaBox();
  setPosition(tain, [80, 6]);
  view.appendChild(tain.element);
  var taout = createTextareaBox();
  setPosition(taout, [80, 140]);
  view.appendChild(taout.element);
  var lastEditedPlaintext = true;
  //tain.addUpdateListener((x) => (lastEditedPlaintext = true));
  tain.addFocusListener((x) => (lastEditedPlaintext = true));
  //taout.addUpdateListener((x) => (lastEditedPlaintext = false));
  taout.addFocusListener((x) => (lastEditedPlaintext = false));

  // Function boxes
  setPosition(funcBox, tr(ori, [100, 50]));
  view.appendChild(funcBox.element);
  cbin.addUpdateListener(function(x) {
    cbout.set(funcBox.getMap().map(x));
  });
  cbout.addUpdateListener(function(x) {
    cbin.set(funcBox.getMap().unmap(x));
  });
  funcBox.getMap().addMapChangeListener(function() {
    if (lastEditedPlainchar)
      cbout.set(funcBox.getMap().map(cbin.getValue()));
    else
      cbin.set(funcBox.getMap().unmap(cbout.getValue()));
  });
  tain.addUpdateListener(function(x) {
    taout.set(funcBox.getMap().map(x));
  });
  taout.addUpdateListener(function(x) {
    let tmp = funcBox.getMap().unmap(x);
    temp = funcBox.getMap();
    tain.set(funcBox.getMap().unmap(x));
  });
  funcBox.getMap().addMapChangeListener(function() {
    if (lastEditedPlaintext)
      taout.set(funcBox.getMap().map(tain.getValue()));
    else
      tain.set(funcBox.getMap().unmap(taout.getValue()));
  });
  let toggleCollapse = function(e) {
    if (funcBox.isCollapsed()) {
      funcBox.expand();
      setPosition(cbout, tr(ori, [808, 64]));
      view.removeChild(arr2c.element);
      view.appendChild(arr2.element);
    } else {
      funcBox.collapse();
      setPosition(cbout, tr(ori, [236, 64]));
      view.removeChild(arr2.element);
      view.appendChild(arr2c.element);
    }
  };
  funcBox.element.addEventListener('dblclick', toggleCollapse);
  var freqCount = createFrequencyCount();
  if (showFreq) { view.appendChild(freqCount.element); }
  taout.addValSetListener(function(x) {
    freqCount.recount(x);
  });
  setPosition(freqCount, [860, 10]);
  let objsets = [
    [funcBox],
    [arr1, arr2, arr2c, cbin, cbout],
    [tain, taout],
    [freqCount]
  ];
  let setVis = function(index, visflag) {
    for (let i = 0; i < objsets[index].length; i++) {
      objsets[index][i].element.style.display = visflag ? "" : "none";
    }
  };
  return {
    'element': view,
    'setVis': setVis,
  };
};

var createSingleCharMapViewNTB = function(funcBox) {
  let getDims = function() {
    let D = funcBox.getDims();
    return [D[0], 834];
  }
  let view = document.createElement("div");
  //view.style = "border: 3px solid #73AD21;";
  view.style.position = "relative";
  view.style.height = (6 + funcBox.getDims()[0]) + "px";
  view.style.width = 834 + "px";

  let mysetPosition = function(left, top) { //-- strings with units!
    view.style.top = top;
    view.style.left = left;
  };


  let ori = [0, funcBox.getDims()[0] / 2];
  var arr1 = createArrow(tr(ori, [25, 0, 100, 0]));
  view.appendChild(arr1.element);
  var arr2 = createArrow(tr(ori, [734, 0, 809, 0]));
  var arr2c = createArrow(tr(ori, [162, 0, 237, 0]));
  view.appendChild(arr2.element);

  // Char boxes
  var cbin = createCharBox();
  setPosition(cbin, tr(ori, [6, -10]));
  var cbout = createCharBox();
  setPosition(cbout, tr(ori, [808, -10]));

  var anchorInput = true;
  var setAnchorInput = ((bval) => anchorInput = bval);
  cbin.addFocusListener((x) => setAnchorInput(true));
  cbout.addFocusListener((x) => setAnchorInput(false));


  // Function boxes
  setPosition(funcBox, [100, 0]);
  view.appendChild(funcBox.element);
  cbin.addUpdateListener(function(x) {
    if (funcBox.isChainedFunctionBox == true) return;
    cbout.set(funcBox.getMap().map(x));
  });
  cbout.addUpdateListener(function(x) {
    if (funcBox.isChainedFunctionBox == true) return;
    cbin.set(funcBox.getMap().unmap(x));
  });
  funcBox.getMap().addMapChangeListener(function() {
    if (anchorInput)
      cbout.set(funcBox.getMap().map(cbin.getValue()));
    else
      cbin.set(funcBox.getMap().unmap(cbout.getValue()));
  });

  if (funcBox.isChainedFunctionBox == true) {
    let chainin = funcBox.tieToOuterInOutCharBoxes(cbin, cbout, setAnchorInput);
  }

  view.appendChild(cbin.element);
  view.appendChild(cbout.element);

  return {
    'element': view,
    'setPosition': mysetPosition,
    'getDims': getDims,
    'getInputCharBox': (() => cbin),
    'getOutputCharBox': (() => cbout),
    'setAnchorInput': setAnchorInput,
    'getFuncBox': (() => funcBox),
    'getVisGroup':(()=>[cbin,cbout,arr1,arr2,arr2c]),
  };
};


var createCharMapView = function(singleCharMapViewNTB, showFreq=true,
                         autolock=false) {
  let lock = false; // when true means input and output are fixed
  let view = document.createElement("div");
  view.style = "position: relative; border: 3px solid #73AD21";
  var tain = createTextareaBox();
  var taout = createTextareaBox();

  let hm = singleCharMapViewNTB.getDims()[0];
  let htain = tain.getDims()[0];
  let htaout = taout.getDims()[0];
  let hpad = 6;
  let hsep = 6;
  let fudge = 26;
  view.style.height = (fudge + hm + htain + htaout + 2 * hpad + 2 * hsep) + "px";

  // Text areas
  let taIndent = 76;
  setPosition(tain, [taIndent, hpad]);
  view.appendChild(tain.element);
  setPosition(taout, [taIndent, fudge + hpad + htain + hm + hsep]);
  view.appendChild(taout.element);
  let labin = createSimpleLabel("plaintext");
  setPosition(labin, [19, hpad]);
  view.appendChild(labin.element);
  let labout = createSimpleLabel("ciphertext");
  setPosition(labout, [12, fudge + hpad + htain + hm + hsep]);
  view.appendChild(labout.element);

  var lastEditedPlaintext = true;
  tain.addFocusListener((x) => {
    if (!lock) {
      lastEditedPlaintext = true;
    }
  });
  taout.addFocusListener((x) => {
    if (!lock) {
      lastEditedPlaintext = false;
    }
  });

  let wrap = document.createElement("div");
  wrap.style.position = "relative";
  wrap.style.marginTop = (hpad + htain + hsep/2 + fudge/2) + "px";
  wrap.style.marginLeft = "5px";
  wrap.style.height = hm + "px";
  //wrap.style = "margin-top:" + 70 + "px; position: relative; " +
  //"height:" + hm + "52px;";
  wrap.appendChild(singleCharMapViewNTB.element);

  view.appendChild(tain.element);
  view.appendChild(wrap);
  view.appendChild(taout.element);

  let funcBox = singleCharMapViewNTB.getFuncBox();
  tain.addUpdateListener(function(x) {
    taout.set(funcBox.getMap().map(x));
  });
  taout.addUpdateListener(function(x) {
    let tmp = funcBox.getMap().unmap(x);
    temp = funcBox.getMap();
    tain.set(funcBox.getMap().unmap(x));
  });
  funcBox.getMap().addMapChangeListener(function() {
    if (lastEditedPlaintext)
      taout.set(funcBox.getMap().map(tain.getValue()));
    else
      tain.set(funcBox.getMap().unmap(taout.getValue()));
  });
  var freqCount = createFrequencyCount();
  if (showFreq) { view.appendChild(freqCount.element); }
  taout.addValSetListener(function(x) {
    freqCount.recount(x);
  });
  setPosition(freqCount, [860, 10]);

  // shadow versions of textareas
  let dain = document.createElement("div");
  dain.className = "lockedTextArea";
  let updateDain = function() {
    dain.innerHTML = addLineBreaks(tain.getValue(), 86);
  }
  tain.addValSetListener(updateDain);
  let daout = document.createElement("div");
  daout.className = "lockedTextArea";
  let updateDaout = function() {
    daout.innerHTML = addLineBreaks(taout.getValue(), 86);
  }
  taout.addValSetListener(updateDaout);
  { let setPosition = function(obj, D) {
      obj.style.left = D[0] + "px";
      obj.style.top = D[1] + "px";
    };
    setPosition(dain, [taIndent, hpad]);
    setPosition(daout, [taIndent, fudge + hpad + htain + hm + hsep]);
  }
  let lockInOut = function() {
      lock = !lock;
      if (lock) {
        tain.element.replaceWith(dain);
        taout.element.replaceWith(daout);
      }
      else {
        dain.replaceWith(tain.element);
        daout.replaceWith(taout.element);
      }
    icon.innerHTML = lock ? "&#x1F512;" : "&#x1F513;";
    icon.style.color = lock ? "red" : "";
  };

  if (autolock)
    funcBox.getMap().addMapChangeListener(
      function() {
        if (!lock && (tain.getValue() != "" || taout.getValue() != ""))
          lockInOut();
      }
    );

  let icon = document.createElement("div");
  icon.style.height = "16px";
  icon.style.width = "16px";
  icon.style.color = "";
  //icon.style.fontWeight="bold";
  icon.style.position = "absolute";
  icon.innerHTML = "&#x1F513;";
  icon.style.left = "45px";
  icon.style.bottom = "5px";
  icon.style.zIndex = "10";
  icon.style.userSelect = "none";
  icon.addEventListener('click', (x) => {
    lockInOut();
  })
  view.appendChild(icon);
  let reset = document.createElement("div");
  reset.className = "resetButton";
  reset.innerHTML = "<span style='margin:auto'>reset</span>";
  reset.style.left = "3px";
  reset.style.bottom = "3px";
  reset.addEventListener('click', (x) => {
    if (lock) lockInOut();
    tain.set("");
    taout.set("");
  })
  view.appendChild(reset);

  return {
    'element': view,
//    'setVis': setVis,
    'lockInOut': lockInOut,
    'getVisGroup':(()=>[tain,taout,{element:dain},{element:daout},{element:icon}]),
  };
}


var createFrequencyCount = function() {
  let zeros = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  let count = [...zeros]; // clone
  let container = document.createElement("div");
  container.className = "freqCount";
  container.style.width = "360px";
  container.style.height = "190px";
  let setPosition = function(left, top) { //-- strings with units!
    container.style.top = top;
    container.style.left = left;
  };
  let fqc = document.createElement("canvas");
  fqc.width = "360px";
  fqc.height = "190px";
  let ctx = fqc.getContext('2d');
  let chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Array.from(alpha),
      datasets: [{
        label: 'Letter frequencies in ciphertext',
        backgroundColor: 'rgb(255, 99, 132)',
        borderColor: 'rgb(255, 99, 132)',
        data: count,
      }]
    },

    options: {
      legend: {
        display: false
      },
      scaleShowValues: true,
      scales: {
        xAxes: [{
          ticks: {
            autoSkip: false
          }
        }],
        yAxes: [{
          ticks: {
            suggestedMin: 0,
            callback: function(label, index, labels) {
              return label + '%';
            },
            Min: 0,
          }
        }]
      }
    }
  });
  container.appendChild(fqc);

  var recount = function(str) {
    //count = [...zeros];
    for (let i = 0; i < count.length; i++) count[i] = 0;
    let total = 0;
    for (let c of str) {
      let bo = baseoffset(c);
      if (bo[1] != -1) {
        count[bo[1]]++;
        total++;
      }
    }
    for (let i = 0; i < count.length; i++) count[i] = 100.0 * count[i] / total;
    chart.update();
  };
  return {
    element: container,
    'recount': recount,
    'setPosition': setPosition,
  };
}
var createEnglishFrequencyCount = function() {
  let container = document.createElement("div");
  container.className = "freqCount";
  container.style.width = "360px";
  container.style.height = "190px";
  let setPosition = function(left, top) { //-- strings with units!
    container.style.top = top;
    container.style.left = left;
  };
  let fqc = document.createElement("canvas");
  fqc.width = "360px";
  fqc.height = "190px";
  let ctx = fqc.getContext('2d');
  let chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Array.from(alpha),
      datasets: [{
        label: 'Letter frequencies in English',
        backgroundColor: 'rgb(0, 99, 132)',
        borderColor: 'rgb(0, 99, 132)',
        data: engLetFreq,
      }, ]
    },

    options: {
      legend: {
        display: false
      },
      scaleShowValues: true,
      scales: {
        xAxes: [{
          ticks: {
            autoSkip: false
          }
        }],
        yAxes: [{
          ticks: {
            suggestedMin: 0,
            callback: function(label, index, labels) {
              return label + '%';
            },
          }
        }]
      }
    }
  });
  container.appendChild(fqc);
  return {
    element: container,
    'setPosition': setPosition,
  };
}


var preCollapseHeights = {};
var secCollapseExpand = function(elt, cflag) {
  for (let i = 0; i < elt.children.length; i++)
    elt.children[i].style.display = (cflag ? "none" : "");
  if (cflag) {
    preCollapseHeights[elt] = elt.clientHeight;
    elt.style.height = "1px";
  } else {
    elt.style.height = preCollapseHeights[elt]+"px";
  }
}
/***
title : string
body : a DIV element
***/
var createSection = function(title, body) {
  let sec = document.createElement("div");
  let ttl = document.createElement("span");
  ttl.className = "secTitle";
  if (typeof(title) == "string")
    ttl.innerHTML = title + "&nbsp;";
  else {
    ttl.appendChild(title);
    tmp = document.createElement("span");
    tmp.innerHTML = "&nbsp;"
    ttl.appendChild(tmp);
  }
  let but = createCTile("-");
  but.style.display = "inline";
  but.style.paddingLeft = "2px";
  but.style.paddingRight = "2px";
  [ttl, but, body].forEach(elt => {
    sec.appendChild(elt)
  });
  let setBody = function(newbody) {
    sec.removeChild(body);
    sec.appendChild(newbody);
    body = newbody;
  };
  let expandedflag = true;
  let toggle = function() {
    secCollapseExpand(body, expandedflag);
    expandedflag = !expandedflag;
    but.innerText = expandedflag ? "-" : "+";
  }
  but.addEventListener('click', (e) => {
    toggle();
  });
  let setVis = function(onoff) {
    sec.style.display = onoff == "off" ? "none" : "";
  }
  return {
    'element': sec,
    'setBody': setBody,
    'setVis': setVis,
  };
}

var createCharMapGeneric = function(charMap, label) {
  let tab = document.createElement("TABLE");
  let row = tab.insertRow();
  let charMapLabel = createCharMapLabel(true);
  //let charMap = createCharMap();
  //charMap.setMapString(mixMapString);
  let lab = document.createElement("span");
  lab.style.fontFamily = "monospace";
  lab.innerHTML = "&nbsp;" + label;
  row.insertCell().appendChild(charMapLabel);
  row.insertCell().appendChild(charMap.element);
  row.insertCell().appendChild(lab);

  return {
    "element": tab,
    "map": ((c) => charMap.map(c)), //cmMap(charMap, c)),
    "unmap": ((c) => charMap.unmap(c)), //{ return cmUnmap(charMap, c)}),
    "addMapChangeListener": ((x) => {
      charMap.addMapChangeListener(x);
    }),
    "getCharMap": (() => charMap),
    'getDims': charMap.getDims,
  };
}

var createCharMapMix = function() {
  let tab = document.createElement("TABLE");
  let row = tab.insertRow();
  let charMapLabel = createCharMapLabel();
  let charMap = createCharMap();
  charMap.setMapString(mixMapString);
  let lab = document.createElement("span");
  lab.style.fontFamily = "monospace";
  lab.innerHTML = "&nbsp;mix";
  row.insertCell().appendChild(charMapLabel);
  row.insertCell().appendChild(charMap.element);
  row.insertCell().appendChild(lab);

  return {
    "element": tab,
    "map": ((c) => charMap.map(c)), //cmMap(charMap, c)),
    "unmap": ((c) => charMap.unmap(c)), //{ return cmUnmap(charMap, c)}),
    "addMapChangeListener": ((x) => {}),
    "getCharMap": (() => charMap),
    'getDims': charMap.getDims,
  };
}


var createMixFunctionBox = function(tmp = null) {
  var map1;
  if (tmp != null) {
    map1 = tmp;
  } else {
    map1 = createCharMapMix();
  }
  let dims = [map1.getDims()[0], 620]; // dims: array of [height,width] in px
  let currDims = [...dims];
  let fb = document.createElement("div");
  fb.className = "funbox";
  fb.style.height = dims[0] + "px";
  fb.style.width = dims[1] + "px";
  fb.appendChild(map1.element);
  let getMap = () => {
    return map1;
  };
  let setPosition = function(left, top) { //-- strings with units!
    fb.style.left = left;
    fb.style.top = top;
  };
  let origWidth = -1;
  let isCollapsed = false;
  let collapse = function() {
    map1.element.style.display = "none";
    origWidth = fb.style.width;
    fb.style.width = '48px';
    currDims[1] = 48;
    isCollapsed = true;
  };
  let expand = function() {
    map1.element.style.display = "";
    fb.style.width = origWidth;
    currDims[1] = dims[1];
    isCollapsed = false;
  };
  return {
    'element': fb,
    'getMap': getMap,
    'setPosition': setPosition,
    'collapse': collapse,
    'expand': expand,
    'isCollapsed': (() => isCollapsed),
    'getDims': (() => currDims),
  };
}

var createChainedFunctionBox = function(subFunctionBoxes) {
  let N = subFunctionBoxes.length;
  let subMapViews = subFunctionBoxes.map(createSingleCharMapViewNTB);
  let unscaledSepAmt = 16;
  let scaleFactor = 0.75;
  let ht = 0;
  for (let i = 0; i < subFunctionBoxes.length; i++) {
    ht += subFunctionBoxes[i].getDims()[0];
  }
  let height = (ht + (N - 1) * unscaledSepAmt) + 2 * 4 + N * 6;
  let dims = [height, 620]; // dims: array of [height,width] in px
  let currDims = [...dims];
  let fb = document.createElement("div");
  fb.className = "funbox";
  fb.style.height = dims[0] * scaleFactor + "px";
  fb.style.width = dims[1] + "px";
  fb.style.backgroundColor = "yellow";

  // Create container to scale contents in
  let cfcontainer = document.createElement("div");
  //cfcontainer.style="border: 5px solid red;"
  cfcontainer.position = "relative";
  cfcontainer.style.height = dims[0] / scaleFactor + "px";
  cfcontainer.style.width = dims[1] / scaleFactor + "px";
  //cfcontainer.style.backgroundColor = "yellow";

  // tie inputs and outputs together
  for (let i = 1; i < N; i++) {
    let cbout = subMapViews[i - 1].getOutputCharBox();
    let cbin = subMapViews[i].getInputCharBox();
    cbin.addUpdateListener((x) => cbout.set(x));
    cbout.addUpdateListener((x) => cbin.set(x));
  }


  let tmpOrg = [0, 0];
  let ytmp = 4;
  for (let i = 0; i < N; i++) {
    let mv = subMapViews[i];
    applySetPosition(mv, tr(tmpOrg, [0, ytmp]).map((x) => x));
    cfcontainer.appendChild(mv.element);
    ytmp += unscaledSepAmt;
  }
  ytmp = 6;
  let fudge = 4;
  for (let i = 0; i < N - 1; i++) {
    let d1 = subMapViews[i].getDims()[0];
    let d2 = subMapViews[i + 1].getDims()[0];
    let y0 = ytmp + d1 / 2;
    let y1 = fudge + ytmp + d1 + unscaledSepAmt / 2;
    let y2 = fudge + ytmp + d1 + unscaledSepAmt + d2 / 2;
    var arr1 = createArrow([818, y0, 818, y1, 18, y1, 18, y2], true);
    cfcontainer.appendChild(arr1.element);
    ytmp += unscaledSepAmt + d1 + 2 * fudge - 2;
  }

  //var arr1 = createArrow(tr(tmpOrg, [818, 24, 818, 66, 16, 66, 16, 88]), true);
  //cfcontainer.appendChild(arr1.element);
  //var arr2 = createArrow(tr([0, 71], [818, 24, 818, 66, 16, 66, 16, 88]), true);
  //cfcontainer.appendChild(arr2.element);
  cfcontainer.style.transformOrigin = "left top";
  cfcontainer.style.transform = "scale(" + scaleFactor + ")";

  // Keep a regular CharMap that mirrors the map defined by the chain
  let getMapAsString = function() {
    let res = alpha.split("");
    for (let i = 0; i < res.length; i++) {
      let c = alpha[i];
      for (let j = 0; j < subFunctionBoxes.length; j++) {
        c = subFunctionBoxes[j].getMap().map(c);
      }
      res[i] = c;
    }
    return res.join("");
  };
  let singleMapEquivalent = createCharMap(getMapAsString());
  for (let j = 0; j < subFunctionBoxes.length; j++) {
    subFunctionBoxes[j].getMap().addMapChangeListener(
      () => singleMapEquivalent.setMapString(getMapAsString())
    );
  }
  let getMap = function() {
    return singleMapEquivalent;
  };
  temp = singleMapEquivalent;


  //var map1 = createCharMapMix();
  fb.appendChild(cfcontainer);
  let setPosition = function(left, top) { //-- strings with units!
    fb.style.left = left;
    fb.style.top = top;
  };
  let origWidth = -1;
  let isCollapsed = false;
  let collapse = function() {
    map1.element.style.display = "none";
    origWidth = fb.style.width;
    fb.style.width = '48px';
    currDims[1] = 48;
    isCollapsed = true;
  };
  let expand = function() {
    map1.element.style.display = "";
    fb.style.width = origWidth;
    currDims[1] = dims[1];
    isCollapsed = false;
  };
  let tieToOuterInOutCharBoxes =
    function(outerCbin, outerCbout, setAnchorInput) {
      let cbout = subMapViews[N - 1].getOutputCharBox();
      let cbin = subMapViews[0].getInputCharBox();
      cbin.addUpdateListener((x) => outerCbin.set(x));
      outerCbin.addUpdateListener((x) => cbin.set(x));
      cbout.addUpdateListener((x) => outerCbout.set(x));
      outerCbout.addUpdateListener((x) => cbout.set(x));
      cbin.addFocusListener((x) => setAnchorInput(true));
      cbout.addFocusListener((x) => setAnchorInput(false));

  }
  return {
    'element': fb,
    'getMap': getMap,
    'setPosition': setPosition,
    'collapse': collapse,
    'expand': expand,
    'isCollapsed': (() => isCollapsed),
    'getDims': (() => [dims[0] * scaleFactor, dims[1]]),
    'isChainedFunctionBox': true,
    'tieToOuterInOutCharBoxes': tieToOuterInOutCharBoxes,
  };
}
