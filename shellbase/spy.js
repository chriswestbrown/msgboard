commandExec["inject"] = function(rest) {
    const http = new XMLHttpRequest();
    var url = "spyconfig.cgi?opt="+encodeURI(optstr);
    http.open("GET",url);
    http.send();
    http.onreadystatechange=(e)=>{
	var resp = http.responseText;
    }
    
    
    return "";
}
