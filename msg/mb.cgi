#!/usr/bin/perl

########################################################
#
########################################################

# setup perl for good CGI use
use strict;
use CGI::Carp qw( fatalsToBrowser );
use CGI qw( :standard );

# "Hasher" is a module in this directory!
use File::Basename;
use lib dirname (__FILE__);
use Hasher;

# check credentials
my $uname = Hasher::decodeCookie(cookie("uname"));
my $pswd = Hasher::decodeCookie(cookie("pswd"));
my $hashFlag = (-e "hash");
my $saltFlag = (-e "salt");

# read & store passwd file
open(PWF,"< pswd.txt");
my $success = "";
my $firstuname = "";
while(<PWF>)
{
    my $salt = "";
    my $un;    
    my $pw;
    if ($saltFlag) 
    { my $t = ($_ =~ /(.*)\:(.*)\:(.*)/); if ($t) { $un = $1;  $pw = $2; $salt = $3; } }
    else 
    { my $t = ($_ =~ /(.*)\:(.*)/);  if ($t) { $un = $1;  $pw = $2; } }
    if ($un && !$firstuname) { $firstuname = $un; }
    if ($un eq $uname) { $success = $pw eq Hasher::hasher($pswd,$salt,$hashFlag); }
}
close(PWF);
if (!$success) 
{ 
print <<END;
Content-type: text/html; charset=UTF-8

<html><body>
<script type="text/javascript">
document.location="login.html";
</script>
</body></html>

END
exit(0);
}

# check for file being locked
if (-e "lock")
{
print <<END;
Content-type: text/html; charset=UTF-8

<html><body>
<script type="text/javascript">
setInterval(function() { document.location="mb.html"; },3000);
</script>
<b id="err">The message board is locked for posting</b>
<script type="text/javascript">
setInterval(function() { 
    document.getElementById("err").innerHTML += " .";
},250);
</script>
</body></html>
END

exit(0);
}

# add msg to file of messages:
my $msg = param("msg");
if (-e "escape" && $firstuname ne $uname) 
{ 
    $msg =~ s/</&lt;/g; 
    $msg =~ s/>/&gt;/g; 
}
my $contents = "";
if ($msg ne "clearit" || $firstuname ne $uname)
{
    open(MSG,">> msgRAW") 
	|| die "could not open message file\n";
    print MSG "<b>$uname</b>: $msg<br>\n";
}
else
{
    open(MSG,"> msgRAW") 
	|| die "could not open message file\n";
}
close(MSG);
$contents = `/bin/cat msgRAW`;

# recreate file
open(MBP,"> mb.html") 
    || die "could not open mb.html\n";
print MBP <<END;
<html>
<head>
<meta http-equiv="Cache-Control" content="no-cache, no-store,
					  must-revalidate" />
<meta http-equiv="Pragma" content="no-cache" />
    <meta http-equiv="Expires" content="0" />
    <script type="text/javascript">
    setInterval(function() {
	if (document.forms.namedItem('mbin').msg.value == "")
	    document.location="mb.html"; },9000);
    </script>
</head>
<body>
<!--<script type="text/javascript">window.location.reload(true);</script>-->
<h1>Message Board</h1>
$contents
<hr>
    <form action="mb.cgi" name="mbin">
      <input type="text" name="msg" style='width:700pt;'>
      <input type="button" onclick="submit()" value="post message">
    </form>
    <a href="login.html">login</a> &nbsp;&nbsp; 
    <a href="newacct.html">create new account</a>
</body></html>
END
close(MBP);

# Print the HTTP reply (which is mostly just the HTML)
# note: &#176; is unicode for the degree symbol
print <<END;
Content-type: text/html; charset=UTF-8

<html><body>
<script type="text/javascript">
document.location="mb.html";
</script>
</body></html>
END


