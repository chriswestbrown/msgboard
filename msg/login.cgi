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

# get login username and passwd
my $uname = param("uname");
my $pswd = param("pswd"); 

# ERROR CHECK: Password and Username must be non-empty
if (!$uname) { Hasher::errPage("No username entered!"); exit(0); }
if (!$pswd) { Hasher::errPage("No password entered!"); exit(0); }

# Escape <,>,& in uname if that option is selected
if (-e "escapeuname") { $uname = Hasher::escapeit($uname); } 

my $hashFlag = (-e "hash");
my $saltFlag = (-e "salt");

# read & store passwd file
open(PWF,"< pswd.txt");
my $success = "";
while(<PWF>)
{
    my $salt = "";
    my $un;    
    my $pw;
    if ($saltFlag) 
    { my $t = ($_ =~ /(.*)\:(.*)\:(.*)/); if ($t) { $un = $1;  $pw = $2; $salt = $3; } }
    else 
    { my $t = ($_ =~ /(.*)\:(.*)/);  if ($t) { $un = $1;  $pw = $2; } }
    my $tmp = $pswd;
    if ($hashFlag) # If we're in hash mode ... hash!
    { 
	my $comm = "echo -n '".$pswd.$salt."' | iconv -f ISO-8859-1 -t UNICODELITTLE | openssl dgst -md4";
	$tmp = `$comm`;
	chop $tmp;
    }
    if ($un eq $uname) { $success = $pw eq Hasher::hasher($pswd,$salt,$hashFlag); }
}
close(PWF);
if (!$success) { Hasher::errPage("Password does not match!"); exit(0); }

# set cookies
my $Euname = Hasher::encodeCookie($uname);
my $Epswd = Hasher::encodeCookie($pswd);
print( "Set-Cookie: uname=$Euname;\n" );
print( "Set-Cookie: pswd=$Epswd;\n" );

# Print the HTTP reply (which is mostly just the HTML)
# note: &#176; is unicode for the degree symbol
print <<END;
Content-type: text/html;

<html><body>
<script type="text/javascript">
document.location="mb.html";
</script>
</body></html>
END


