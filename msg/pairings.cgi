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

my $leaveout = param("leaveout");

my $comm = "cat mb.html | egrep -o '^<b>.+<\/b>' | tr -d '\\r' | sort -u";
my $mb = `$comm`;
my @lines = split /\n/, $mb;
my @names = ( );
foreach my $line (@lines) {
    if ($line =~ /^<b>(.+)<.b>/ && not ($1 eq $leaveout)) { push(@names,($1)); }
}

print "\n\nHere are the pairings:<br>   ";
my $n = scalar(@names);
if ($n % 2 == 1) { push(@names,($ARGV[1])); }
my $k0 = 0;
while($k0 < $n) {
    my $a = $names[$k0++];
    my $b = $names[$k0++];
    print "$a --- $b   <br>   ";
}
print "\n";
