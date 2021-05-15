#!/usr/bin/perl
use DBI;
use URI::Escape::XS qw/uri_escape uri_unescape/;
use MIME::Base64 qw(encode_base64);

# Get names
my @names = ();
my $filename = $ARGV[0];
open(FH, '<', $filename) or die $!;
while(<FH>) {
    chomp;
    if ($_ ne "") {
	push(@names,$_);
    }
}

my $dbfile = "sidechannel.db";
if (-e $dbfile) {
    `rm -f sidechannel.db`;
}

# Create database and pairs table
my $dbh = DBI->connect("dbi:SQLite:dbname=$dbfile","","");
{
    my $sth = $dbh->prepare("CREATE TABLE pairs (name TEXT NOT NULL, pid INTEGER, id INTEGER);");
    $sth->execute();    
}

# Create msgs table
{ 
    my $sth = $dbh->prepare("CREATE TABLE msgs (pid INTEGER, n1 TEXT, n2 TEXT, m1 TEXT, m2 TEXT);");
    $sth->execute();    
}


my $i = 0;
my $n = int(scalar(@names)/2); 
while($i < $n) {
    my $n1 = encode_base64(uri_escape($names[2*$i]));
    my $n2 = encode_base64(uri_escape($names[2*$i+1]));
    my $sth1 = $dbh->prepare("INSERT INTO pairs (name, pid, id) VALUES ('$n1',$i,1);");
    $sth1->execute();    
    my $sth2 = $dbh->prepare("INSERT INTO pairs (name, pid, id) VALUES ('$n2',$i,2);");
    $sth2->execute();

    my $sth3 = $dbh->prepare("INSERT INTO msgs (pid, n1, n2) VALUES ($i,'$n1','$n2');");
    $sth3->execute();
    
    $i++;
}
