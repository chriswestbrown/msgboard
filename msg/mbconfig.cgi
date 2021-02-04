#!/usr/bin/perl

########################################################
# call with e.g.  ?opt=insecure+hash
########################################################

# setup perl for good CGI use
use strict;
use CGI::Carp qw( fatalsToBrowser );
use CGI qw( :standard );

# "Hasher" is a module in this directory!
use File::Basename;
use lib dirname (__FILE__);
use Hasher;


# add msg to file of messages:
my $msg = param("opt");
my @params = split(/\s+/,$msg);

my @valid = ("help", "status", "init", "open", "clear", "clearaccts", "wipe", "fullwipe", "new", "nonew", "lock", "unlock", "hash", "nohash", "salt", "nosalt", "escape", "escapeall", "noescape", "secure", "insecure");
my %hash;
@hash{@valid} = ();

my $opts = "";
my $invalid = "";
for my $k (@params) {
    if (exists $hash{$k}) {
	$opts = $opts." ".$k;
    }
    else {
	$invalid = $invalid." ".$k;
    }
}
my $comm = "./mbconf$opts";
my $out = `$comm`;

print <<END;
Content-type: text/plain; charset=UTF-8

END
print "options used:$opts\n";
print "options ignored:$invalid\n\n";

print "$out\n";

