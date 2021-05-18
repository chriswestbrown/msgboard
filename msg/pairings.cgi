#!/usr/bin/perl

########################################################
#
########################################################

# setup perl for good CGI use
use strict;
use CGI::Carp qw( fatalsToBrowser );
use CGI qw( :standard );
use Cwd qw(getcwd);

# "Hasher" is a module in this directory!
use File::Basename;
use lib dirname (__FILE__);
use Hasher;

my $origdir = getcwd();

# pull out options
my $sflag = 0; # make the secret comms page
my $dflag = 0; # destroy the secret comms page
my $hflag = 0; # help
my $leaveout = "";
my $msg = param("opt");
my @params = split(/\s+/,$msg);
for my $k (@params) {
    if ($k == "-s") { $sflag = 1; }
    else if ($k == "-d") { $dflag = 1; }
    else { $leaveout = $k;  }
}

my $resp = "";
if ($hflag == 1) { $resp = "usage: mbpairs [-s|-d|-h] [&lt;leaveout&gt;]\n"; }
elsif ($dflag == 1) {
    chdir("sec");
    `./destroy.pl`;
    `rm -f sidechannel.db`;
    $resp = "Secret channel destroyed!\n";
    chdir($origdir);
}

### set up HTTP output
print <<END;
Content-type: text/plain; charset=UTF-8

END

### cases where we aren't constructing pairs
if ($resp ne "") { print $resp; exit(0); }

### construct pairs (possibly echoing to file)
my $comm = "cat pswd.txt | egrep -o '^<b>.+<\/b>' | tr -d '\\r' | sort -u";
my $mb = `$comm`;
my @lines = split /\n/, $mb;
my @names = ( );
foreach my $line (@lines) {
    if ($line =~ /^<b>(.+)<.b>/ && not ($1 eq $leaveout)) { push(@names,($1)); }
}

if ($sflag == 1) { open(FH,"> sec/names.txt") || die $!; }

print "Here are the pairings:<br>   ";
my $n = scalar(@names);
if ($n % 2 == 1) { push(@names,($ARGV[1])); }
my $k0 = 0;
while($k0 < $n) {
    my $a = $names[$k0++];
    my $b = $names[$k0++];
    print "$a --- $b   <br>   ";
    if ($sflag == 1) { print FH "$a\n$b\n"; }    
}
print "\n";
if ($sflag == 1) { close(FH); }

### create the database in sec
if ($sflag == 1) { 
    chdir("sec"); 
    `./create.pl names.txt`;
    chdir($origdir);
    print('<a href="sec/schannel.html" target="_blank" rel="noopener noreferrer">secret channel</a>
}
