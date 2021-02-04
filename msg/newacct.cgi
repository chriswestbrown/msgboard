#!/usr/bin/perl

########################################################
#
# This looks for the existence of a file 'hash'.  If
# that file does not exist, passwords are stored unhashed.
# If that file does exist, passwords are stored hashed.
########################################################

# setup perl for good CGI use
use strict;
use CGI::Carp qw( fatalsToBrowser );
use CGI qw( :standard );

# "Hasher" is a module in this directory!
use File::Basename;
use lib dirname (__FILE__);
use Hasher;

# check for the message board being locked for new account creation
if (-e "nonew")
{
print <<END;
Content-type: text/html; charset=UTF-8

<html><body>
<script type="text/javascript">
setInterval(function() { document.location="mb.html"; },3000);
</script>
<b id="err">The message board is locked for new account creation</b>
<script type="text/javascript">
setInterval(function() { 
    document.getElementById("err").innerHTML += " .";
},250);
</script>
</body></html>
END

exit(0);
}

# get login username and passwd
my $uname = param("uname");
my $pswd = param("pswd"); 

# ERROR CHECK: Password and Username must be non-empty
if (!$uname) { Hasher::errPage("No username entered!"); exit(0); }
if (!$pswd) { Hasher::errPage("No password entered!"); exit(0); }

# Escape <,>,& in uname if that option is selected
if (-e "escapeuname") { $uname = Hasher::escapeit($uname); } 

# ERROR CHECK: Usernames and passwords may not contain the characters : or ' or % or &
# no : because that's the separator in the password file, and dealing with that would confuse
#      every student's experience
# no ' because when we use hashing on the command line we use single quotes around the string
#      to hash precisely so other special characters don't have special meanings!
if ($uname =~ /\'|\:/ || $pswd =~ /\'|\:/)
{
    Hasher::errPage("Usernames and passwords may not contain : or &apos; characters."); 
    exit(0);
}

my $hashFlag = (-e "hash");
my $saltFlag = (-e "salt");
my $tmp = $pswd;
my $salt = "";
if ($saltFlag)
{
    my @chars=('a'..'z','A'..'Z','0'..'9',);
    for (my $count = 0; $count < 10; $count++) { $salt .= $chars[rand @chars]; }
}
$tmp = Hasher::hasher($pswd,$salt,$hashFlag);

# read & store passwd file
open(PWF,"< pswd.txt");
my $success = "";
while(<PWF>)
{
  my $t = ($_ =~ /([^:]*)\:(.*)/);
  if ($t && $1 eq $uname) { $success = 1; }
}
close(PWF);

# ERROR CHECK: User name already exists
if ($success) { Hasher::errPage("user name already exists!"); exit(0); }

# add credentials to passwd file
open(PWF,">> pswd.txt");
if ($saltFlag) { print PWF "$uname:$tmp:$salt\n"; }
else           { print PWF "$uname:$tmp\n"; }
close(PWF);

# set cookies
my $Euname = Hasher::encodeCookie($uname);
my $Epswd = Hasher::encodeCookie($pswd);
print( "Set-Cookie: uname=$Euname;\n" );
print( "Set-Cookie: pswd=$Epswd;\n" );

# Print the HTTP reply (which is mostly just the HTML)
print <<END;
Content-type: text/html;

<html><body>
<script type="text/javascript">
document.location="mb.html";
</script>
</body></html>

END


