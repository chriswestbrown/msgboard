// Elizabeth specific code


// helper functions
clearCurrentTerminalLine = function() {
    var lineLen = term.buffer._buffer.x;
    for(j = 0; j < (lineLen-2); j++)
	term.write("\b");
    for(j = 0; j < (lineLen-2); j++)
	term.write(" ");
    for(j = 0; j < (lineLen-2); j++)
	term.write("\b");
}

//-- COMMANDS -------------------------------------------
commandExec = new Object();
commandExec["help"] = function(rest) {
    return String(Object.keys(commandExec).sort()) + "\r\n";
}
commandExec["md5"] = function(rest) {
    return CryptoJS.MD5(rest).toString() + "\r\n";
}
commandExec["clear"] = function(rest) {
    term.reset();
    return "";
}
commandExec["rytop"] = function(rest) {
    var n = (rest == "" ? 20 : Number(rest));
    if (n < 1 || n > 100)
	n = 20;
    var k;
    var result = "";
    for(k = 0; k < n; k++) {
	result += ryt100[k] + "\r\n";
    }
    return result;
}

// Keyboard lockout (for waiting)
keyboardLockOut = false;

// This is there to make copy and paste work
inKeyEvent = false;
stemTermPaste = function(terminal,text)
{
    if (!inKeyEvent && !keyboardLockOut)
	term.write(text);
    inKeyEvent = false;
}


// history
history = new Object();
history.array = [];
count = 0;
upPressed = 0;

