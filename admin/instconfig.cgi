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

sub checkname { return $_[0] =~ /^[a-z0-9]*$/; }
sub checkpswd { return $_[0] =~ /^[a-zA-Z0-9]*$/; }

# add msg to file of messages:
my $msg = param("opt");
my @param = split(/ /,$msg);
my $out = "error!";

if (scalar(@param) < 1) {
    $out = 'Error! "opt" parameter with at least one space-separated value required!';
}
else {
    $out = "Command \"$param[0]\" not found!";
    if ($param[0] eq "list")
    {
	$out = `./listSites`;
    }
    if ($param[0] eq "add")
    {
	if (scalar(@param) < 3) {
	    $out = 'Error! "add" requires two additional arguments!';
	}
	else {
	    my $name = $param[1];
	    my $pass = $param[2];
	    if (checkname($name) && checkpswd($pass)) {
		my $comm = "./installInstructor $name $pass";
		$out = `$comm`;
	    }
	    else {
		$out = "Error! names may only contain [a-z0-9], pswd [a-zA-Z0-9].";
	    }
	}
    }
    elsif ($param[0] eq "rem")
    {
	if (scalar(@param) < 2) {
	    $out = 'Error! "rem" requires one additional argument!';
	}
	my $name = $param[1];
	if (checkname($name)) {
	    my $comm = "./removeInstructor $name";
	    $out = `$comm`;
	}
	else {
	    $out = "Error! names may only contain [a-z0-9].";
	}
    }
}

print <<END;
Content-type: text/plain; charset=UTF-8

END

print "$out\n";
