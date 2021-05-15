#!/usr/bin/perl
my $dbfile = "sidechannel.db";
if (-e $dbfile) {
    `rm -f sidechannel.db`;
}
