commandExec["dcrackT"] = function(rest) {
    keyboardLockOut = true;
    const http = new XMLHttpRequest();
    var url = "../shellbase/dcrackT.cgi?opt="+encodeURI("dcrackT " + rest);
    http.onreadystatechange=(e)=>{
	if (http.readyState == 4 && http.status == 200) {
	    var resp = http.responseText.trimEnd();
	    term.write(resp.replace(/[\n]/g,"\r\n") + "\r\n");
	    prompt(term);
	    keyboardLockOut = false;
	}
    }    
    http.open("GET",url);
    http.send();
    return "";
}


commandExec["dcrack"] = function(rest) {
    let re = RegExp(/([0-9a-fA-F]{32})((\s+|\s*:\s*)(\S*))?\s*$/);
    let mt = rest.match(re);
    if (mt == null) { return "usage: dcrack <hash>:<salt>\r\n"; }
    let targetHash = mt[1];
    let salt = typeof(mt[4]) == "string" ? mt[4] : "";
    term.write("using hash = " + targetHash + ", salt = " + salt + " ...\r\n");
    keyboardLockOut = true;
    let currNum = 0;
    let respondFun = (e)=>{
	if (http.readyState == 4 && http.status == 200) {
	    let n = http.responseText.length;
	    console.log("got it ... " + n);
	    let i = 0;
	    let j;
	    let pswd;
	    let hash;
	    let count = 0;
	    while(hash != targetHash && i < n) {
		for(j = i + 1; j < n && http.responseText.charCodeAt(j) != 10; j++) { ; }
		pswd = http.responseText.substring(i,j);
		//console.log("i = " + i + " , j = " + j + " , count = " + count);
		hash = CryptoJS.MD5(pswd + salt).toString()
		//console.log(pswd + " : " + hash);
		i = j+1;
		count++;
	    }
	    
	    if (hash == targetHash)
		term.write(pswd+"\r\n");
	    else if (currNum < 143 && terminateDcrackFlag == true) {
		term.write("Terminating search!\r\n");
		terminateDcrackFlag = false;
	    }
	    else if (currNum < 143) {
		term.write(currNum + "00K searched!\r\n");
		http.abort();
		currNum++;
		http = new XMLHttpRequest();
		url = "../shellbase/rychunks/" + currNum;
		console.log("sending " + url + " ... ");
		http.onreadystatechange=respondFun;
		http.open("GET",url);
		http.send();
		return;
	    }
	    else {
		term.write("No Match!\r\n");
	    }
	    prompt(term);
	    keyboardLockOut = false;
	}
    };
    
    currNum++;
    let http = new XMLHttpRequest();
    let url = "../shellbase/rychunks/" + currNum;
    http.onreadystatechange=respondFun;
    http.open("GET",url);
    http.send();
    return "";
}



var terminateRysearchFlag = false;

commandExec["rysearch"] = function(rest) {
    let re = RegExp(/\s*([^ ]+)/);
    let mt = rest.match(re);
    if (mt == null) { return "usage: rysearch <string>\r\n"; }
    let target = mt[1];
    term.write("using target = " + target + " ...\r\n");
    let tre = new RegExp(target,"i");
    keyboardLockOut = true;
    let matchesFound = 0;
    let currNum = 0;
    let respondFun = (e)=>{
	if (http.readyState == 4 && http.status == 200) {
	    let n = http.responseText.length;
	    console.log("got it ... " + n);
	    let i = 0;
	    let j;
	    let pswd = "";
	    let count = 0;
	    while(!tre.test(pswd) && i < n) {
		for(j = i + 1; j < n && http.responseText.charCodeAt(j) != 10; j++) { ; }
		pswd = http.responseText.substring(i,j);
		i = j+1;
		count++;
	    }
	    
	    if (tre.test(pswd)) {
		term.write(pswd+"\r\n");
		matchesFound++;
		if (matchesFound == 10) {
		    term.write("10 matches found so far ...\r\n");
		    terminateRysearchFlag = true;
		}
	    }
	    if (currNum < 143 && terminateRysearchFlag == true) {
		term.write("Terminating search!\r\n");
		terminateRysearchFlag = false;
	    }
	    else if (currNum < 143) {
		//term.write(".");
		http.abort();
		currNum++;
		http = new XMLHttpRequest();
		url = "../shellbase/rychunks/" + currNum;
		console.log("sending " + url + " ... ");
		http.onreadystatechange=respondFun;
		http.open("GET",url);
		http.send();
		return;
	    }
	    else {
		if (matchesFound == 0) { term.write("No Match!\r\n"); }
	    }
	    prompt(term);
	    keyboardLockOut = false;
	}
    };
    
    currNum++;
    let http = new XMLHttpRequest();
    let url = "../shellbase/rychunks/" + currNum;
    http.onreadystatechange=respondFun;
    http.open("GET",url);
    http.send();
    return "";
}
