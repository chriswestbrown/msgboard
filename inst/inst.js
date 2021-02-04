commandExec["mbconf"] = function(rest) {
    keyboardLockOut = true;
    const http = new XMLHttpRequest();
    var url = "msg/mbconfig.cgi?opt="+encodeURI(rest);
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
