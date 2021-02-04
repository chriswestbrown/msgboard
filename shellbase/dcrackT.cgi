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
#use Hasher;

# add msg to file of messages:
my $msg = param("opt");
my @param = split(/ /,$msg);
my $out = "error!";

if (scalar(@param) < 1) {
    $out = 'Error! "opt" parameter with at least one space-separated value required!';
}
else {
    $out = "Command \"$param[0]\" not found!";
    if ($param[0] eq "dcrackT")
    {
	if (scalar(@param) < 2 || !($param[1] =~ /^([0-9a-fA-F]{3})[0-9a-fA-F]{29}$/)) {
	    $out = "Error! dcrackT requires 128-bit hash!";
	}
	else
	{
	    my $command = "grep $param[1] rysplits/$1";
	    my $res = `$command`;
	    $out = $res;
	    if ($res eq "") { $out = "No match!"; }
		
	}
    }
}

print <<END;
Content-type: text/plain; charset=UTF-8

END

print "$out\n";

