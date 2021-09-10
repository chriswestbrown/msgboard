var DHDinstanceCounter = 0;
var DHDinstanceList = [];
function DHDInstance()
{
    this.iName = "DHD" + DHDinstanceCounter++;
    DHDinstanceList[this.iName] = this;
    this.hasNumbers = false;
    this.showLabel = true;
    this.setIndividual = false;

    /* toggles game-mode vs. individual set */
    this.toggleSetIndividual = function(button) {
	if (this.setIndividual) {
	    this.setIndividual = false;
	}
	else {
	    this.setIndividual = true;
	    let tableCellList = document.getElementById("table"+this.iName).getElementsByTagName("td");
	    let other = "silver";
	    let currColor = other;
	    this.setCellBorders(currColor,tableCellList);
	    let par = this;
	    let blink = function() {
		currColor = (currColor == other || !par.setIndividual ? "orange" : other);
		par.setCellBorders(currColor,tableCellList);
		if (par.setIndividual) { setTimeout(blink,500); }	
	    };
	    setTimeout(blink,500);
	}
    }
    
    this.currN = 0x1FFFFFF;
    this.gen =   0x03a0D35;
    this.ccolor = ['#ffffff','#000000'];
    this.idx2Id = ['c00','c01','c02','c03','c04','c05','c06','c07','c08','c09','c10','c11','c12','c13','c14','c15','c16','c17','c18','c19','c20','c21','c22','c23','c24'];
    this.initColorIdx = function(idx) { var e = document.getElementById(this.idx2Id[idx]); e.style.setProperty("background-color",this.ccolor[1]); }
    this.setColorIdx = function(idx, val) 
    { 
	var e = document.getElementById(this.iName + this.idx2Id[idx]); 
	e.style.setProperty("background-color",this.ccolor[val]);
    }
    this.setColors = function(N)
    {
	var p = 1;
	for(var i = 0; i < 25; i++)
	{
	    this.setColorIdx(i, ((N & p) > 0 ? 1 : 0));
	    p = p*2; 
	}
    }

    this.scramble = function()
    {
	this.clear();
	for(var i = 0; i < 25; ++i)
	{
	    if (Math.round(Math.random()) >= 1) 
	    { 
		this.updatePush(this.iName + this.idx2Id[i]); 
	    }
	}
    }

    this.getToggleVector = function(idx)
    {
        var y = Math.floor(idx/5), x = idx % 5;
        res = [];
	for(var i = 0; i < 3; i++)
	    for(var j = 0; j < 3; j++)
	{
            var dx = [-1,0,1][j], dy = [-1,0,1][i];
            var xp = x + dx, yp = y + dy;
            if (Math.abs(dx) + Math.abs(dy) < 2 && 0 <= xp && xp < 5 && 0 <= yp && yp < 5)
		res.push(yp*5 + xp);
        }
        return res;
    }

    this.setTextToNumber = function()
    {
	if (!this.hasNumbers) { return; }
	var txt = "";
	for(var i = 0; i < 25; i++)
	{
	    txt += ((this.currN & (1 << i)) > 0 ? "1" : "0");
	}
	document.forms['stringRepForm'+this.iName].stringRep.value = txt;    
    }

    this.setNumberToText = function(txt)
    {
	if (!this.hasNumbers) { return; }
	var N = 0;
	for(var i = 24; i >= 0; i--)
	{
	    if (txt[i] == '1') N =  (N | (1 << i));
	}
	this.currN = N;
	this.setColors(this.currN);
	this.setTextToNumber(this.currN);
    }

    this.clear = function() { this.currN = 0x1FFFFFF; this.setColors(this.currN); this.setTextToNumber(this.currN); }

    this.updatePush = function(id)
    {
	if (this.setIndividual) { this.toggleIndividual(id); return; }
	var idx = 0;
	var sid = id.substr(this.iName.length);					 
	for(var i = 0; i < this.idx2Id.length; i++) { if (this.idx2Id[i] == sid) { idx = i; } }
	var A = this.getToggleVector(idx);
	for(var i = 0; i < A.length; i++) { this.currN = this.currN ^ (1 << A[i]); }
	this.setColors(this.currN);
	this.setTextToNumber(this.currN);
    }

    this.toggleIndividual = function(id) {
	var sid = id.substr(this.iName.length);					 
	for(var i = 0; i < this.idx2Id.length; i++) { if (this.idx2Id[i] == sid) { idx = i; } }
	this.currN = this.currN ^ (1 << idx);
	this.setColors(this.currN);
    }

    this.formatTableCells = function()
    {
	for(var idx = 0; idx < 25; idx++) 
	{
	    var e = document.getElementById(this.iName + this.idx2Id[idx]); 
	    e.style.setProperty("color","orange");
	    e.style.setProperty("font-family","monospace");
	    e.style.setProperty("height","1.5em");
	    e.style.setProperty("width","1.5em"); 
	    e.style.setProperty("text-align","center"); 
	}
    }

    this.setLabelVisibility = function()
    {
	for(var idx = 0; idx < 25; idx++) 
	{
	    var e = document.getElementById(this.iName + this.idx2Id[idx]).children[0]; 
	    e.style.setProperty("visibility",this.showLabel ? "visible" : "hidden"); 
	}
    }

    this.setCellBorders = function(color,tableCellList) {
	for (const c of tableCellList) {
	    c.style.borderColor = color;
	}
    }


    /*
      Options: notes:true means see notes.
     */
    this.createContent = function(options)
    {
	let notes = options.notes == true;
	if (notes) {
	document.write('<div style="float: right; width: 1in; height: 1in; margin-right: 1em;"><form onsubmit="return false;"><textarea cols="12" rows="6">notes: </textarea></form></div>\n');
	}
	document.write('<table id="table' + this.iName + '" style="background-color: orange; border-style: solid; border-collapse: collapse; border-width: 2pt; border-color: orange; ">\n');
	for(var r = 0; r < 5; r++)
	{
	    document.write('<tr>\n');
	    for(var c = 0; c < 5; c++)
	    {
		var i = 5*r + c;
		var idlab = this.iName + this.idx2Id[i];
		var lab = String.fromCharCode(i + "a".charCodeAt(0));
		var celltxt = '<td  onclick="DHDinstanceList.'+this.iName+'.updatePush(id);" id="'+idlab+'" ' +
		    'style="height: 1em; width: 1em; min-width: 1em; border-style: solid; border-color: orange; border-width: 2pt; user-select: none;"><span>'+lab+'</span></td>';
		console.log(celltxt);
		document.write(celltxt);
	    }
	    document.write('</tr>\n');
	}
	document.write('</table>\n');

	document.write('<form name="stringRepForm' + this.iName + '" onsubmit="return false;">');
	if (this.hasNumbers)
	{
	    document.write('  Current: <input name="stringRep" type="text" size="25" readonly><br>');
	    document.write('  Set New: <input name="stringRepInput" type="text" size="25" onchange="DHDinstanceList.'+this.iName+'.setNumberToText(value); value=String(); return false;"><br>');
	}
	document.write('  <input type="button" value="clear" onclick="DHDinstanceList.'+this.iName+'.clear();">');
	document.write('  <input type="button" value="scramble" onclick="DHDinstanceList.'+this.iName+'.scramble();">');
	document.write('<br>');
	document.write('  <input type="checkbox" value="freeset" onclick="DHDinstanceList.'+this.iName+'.toggleSetIndividual(this);">freeset</input>');
	document.write('&nbsp;  <input id="foo" type="checkbox" ' + (this.showLabel?" checked ":"") + ' onclick="DHDinstanceList.'+this.iName+'.toggleVisibility(this);">show labels</input>');
	document.write('</form>');
    }

    this.toggleVisibility = function (arg) 
    { 
	this.showLabel = !this.showLabel; 
	this.setLabelVisibility(); 
	if (arg != null) { arg.value = (this.showLabel?"hide":"show") + " labels"; }
    }

}

/*
  Options:
  labels: true/false
  notes: true/false;
*/

function mkPuzzle(options) {
    let labelVisibility = (options.labels == true);
    var DHD = new DHDInstance();   
    DHD.showLabel = labelVisibility;
    DHD.createContent(options);  
    DHD.setColors(DHD.currN);    
    DHD.setTextToNumber(DHD.currN); 
    DHD.formatTableCells();
    DHD.setLabelVisibility();
}

