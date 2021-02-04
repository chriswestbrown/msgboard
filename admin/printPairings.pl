#!/usr/bin/perl

# printPairings.pl <msgboardURL> <instMBName>
# e.g. ./printPairings.pl  http://localhost/ogle/msg/mb.html drbrown
# prints out parings from message board

#curl http://localhost/ogle/msg/mb.html 2>/dev/null | perl -e 'while(<>){ if ($_ =~ /^<b>(.+)<.b>/) { print "$1\n"; }}'

my $comm = "curl $ARGV[0] | egrep -o '^<b>.+<\/b>' | tr -d '\\r' | sort -u";
my $mb = `$comm`;
my @lines = split /\n/, $mb;
my @names = ( );
foreach my $line (@lines) {
    if ($line =~ /^<b>(.+)<.b>/ && not ($1 eq $ARGV[1])) { push(@names,($1)); }
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
