#!/usr/bin/perl

########################################################
#
########################################################

# setup perl for good CGI use
use strict;
use CGI::Carp qw( fatalsToBrowser );
use CGI qw( :standard );
use URI::Escape::XS qw/uri_escape uri_unescape/;

# "Hasher" is a module in this directory!
use File::Basename;
use lib dirname (__FILE__);
use Hasher;

# get uname
my $uname = uri_escape(Hasher::decodeCookie(cookie("uname")));

# get message
my $msg = param("msg");

my $out = `./sendmsg.pl "$uname" "$msg"`;
if ($out eq "") { $out = "ok"; }
print "\n\n$out\n";

