
var terminateDcrackFlag = false;

// prompt(term) - call this to print the prompt
function prompt(term) { term.write('$ '); }

function getCurrentLine()
{
    // I need to check "isWrapped" ... maybe there are extra
    // long lines tox deal with.  Looks like a job for mids ...
    var i = term.buffer._buffer.y + term.buffer._buffer.ybase;
    var wrapRange = term.buffer._buffer.getWrappedRangeForLine(i);
    var line = "";
    var idx;
    for(idx = wrapRange.first; idx <= wrapRange.last; idx++)
	line += term.buffer.getLine(idx).translateToString();
    return line;
}

// runFakeTerminal(term) - starts the fake terminal runnin
function runFakeTerminal(term,msg)
{
    // ensure runFakeTerminal only gets called on term once!
    if (term._initialized) { return; } else { term._initialized = true; }

    // sets function handleKeyEvent(e) as the handler for keyboard events
    term.onKey(handleKeyEvent);

    // prints welcome message and initial prompt
    term.writeln(msg + '\r\n');
    prompt(term);
}


// handleKeyEvent(e)
// this function is passed e, which is a KeyboardEvent object.  This
// is part of the browser's DOM.  It has info about what just happened
// on the keyboard.  See documentation at:
// https://www.w3schools.com/jsref/obj_keyboardevent.asp
function handleKeyEvent(e)
{    
    // This is to stop a double echo!
    inKeyEvent = true;
    
    if (keyboardLockOut) {
	if (e.domEvent.ctrlKey && e.domEvent.keyCode == 67) { // ctrl+c
	    terminateDcrackFlag = true;
	}
	
	return;
    }
    
    const printable = !e.domEvent.altKey && !e.domEvent.altGraphKey
	  && !e.domEvent.ctrlKey && !e.domEvent.metaKey
	  && 32 <= e.key.charCodeAt(0) && e.key.charCodeAt(0) <= 127;

    // change to true for debugging: shows e in the console (ctrl+shift+i)
    if (false) {
	console.log(JSON.stringify(e));
	console.log("printable flag = " + printable + " " + e.key.charCodeAt(0));
    }

    
    
    if (e.domEvent.keyCode === 13) { // enter key pressed
	var line = getCurrentLine().substr(1).trim(); // substr(1) gets rid of the $ prompt
	var comm = "";
	var rest = "";
	if (line != "") {
	    var re = RegExp(/\s+/,"g");
	    var m = re.exec(line);
	    var comm = (m === null ? line : line.substr(0,m.index));
	    var rest = (m === null ? "" : line.substr(re.lastIndex));
	    
	    //var split = line.split(/[ ]+/); //split[0] is the $
	    //var comm = split[1]; // comamnd
	    //var rest = split[2] == undefined ? "" : split[2]; // argument string
	}

	// Handle history
	upPressed = 0;
	if (comm != "") {
	    history.array[count] = comm + " " + rest;
	    count++;
	}

	var addnewline = false;
	if (comm != "") {
	    term.write("\r\n");
	    var todo = commandExec[comm];
	    var result = todo == undefined ? "Command '" + comm + "' not found!\r\n" : todo(rest);
	    var resultT = result.trimEnd();
	    if (result != "") {
		term.write(result);
	    }
	    else
		addnewline = true;
	}
	else
	    addnewline = true;
	if (!keyboardLockOut) {
	    if (addnewline) term.write('\r\n');
	    prompt(term);
	}
    }

    else if (e.domEvent.ctrlKey && e.domEvent.keyCode == 67) { // ctrl+c
	term.write("\r\n");
	prompt(term);
    }
    
    else if (e.domEvent.keyCode === 8) { // backspace
	// writing '\b \b' to the terminal will give us backspace
	// behavior, but we need to make sure we don't backspace
	// over the prompt or the space after the prompt
	
        if (term._core.buffer.x > 2) {
	    var line = getCurrentLine();
	    var index = term.buffer._buffer.x;
	    var before = line.substr(0,index);
	    var after = line.substr(index).trimEnd();
            term.write('\b \b');
	    if (after != "")
	    {
		term.write(after);
		term.write(" ");
		var n = after.length + 1;
		while(n > 0) {
		    term.write("\u001b[D");
		    n--;
		}
	    }	
        }
    }

    else if (e.domEvent.keyCode === 46) { // delete key
	var line = getCurrentLine();
	var index = term.buffer._buffer.x;
	var before = line.substr(0,index);
	var after = line.substr(index).trimEnd();
	if (after != "")
	{
            term.write(after.substr(1));
            term.write(" ");
	    var n = after.length;
	    while(n > 0) {
		term.write("\u001b[D");
		n--;
	    }
	}	
    }

    else if (e.domEvent.keyCode === 37) {//left arrow
	if(term.buffer._buffer.x > 2){//only move left if far enough from left edge
	    term.write(e.key);
	}	
    }
    
    else if (e.domEvent.keyCode === 38) {//up arrow
	if(upPressed == count){//if there are no more commands in history
	    return;
	}
	clearCurrentTerminalLine();	
	//copy in the command from history
	upPressed++;
	var histCommand = history.array[count-upPressed];
	term.write(histCommand);
    }

    
    else if (e.domEvent.keyCode === 39) {//right arrow	
	var line = getCurrentLine();
	line = line.trim();
	var n = line.length;
	if(term.buffer._buffer.x < (n)){
	    term.write(e.key);
	}
	
    }
    else if (e.domEvent.keyCode === 40) {//down arrow
	if(upPressed == 0)//if upPressed hasn't been pressed yet
	    return;
	
	else{
	    upPressed--;
	    clearCurrentTerminalLine();
	    if(upPressed >= 1){
		var histCommand = history.array[count-upPressed];
		term.write(histCommand);
	    }
	}

    }

    else if (printable) { // anything else printable
	var line = getCurrentLine();
	var index = term.buffer._buffer.x;
	var before = line.substr(0,index);
	var after = line.substr(index).trimEnd();
	if (after == "")
	    term.write(e.key);
	else {
            term.write(e.key + after);
	    var n = after.length;
	    while(n > 0) {
		term.write("\u001b[D");
		n--;
	    }
	}
    }
}
