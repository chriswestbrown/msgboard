#!/usr/bin/perl
use DBI;
use MIME::Base64 qw(decode_base64);
use MIME::Base64 qw(encode_base64);

# get name and message
my $name = encode_base64($ARGV[0]);

# open database
my $dbfile = "sidechannel.db";
if (! -e $dbfile) {
    print("ERROR! DB does not exist!\n");
    exit 1;
}
my $dbh = DBI->connect("dbi:SQLite:dbname=$dbfile","","");

# fetch data for name
my $sth = $dbh->prepare("SELECT name, pid, id FROM pairs WHERE name = '$name';");
$sth->execute();    
if ( @row = $sth->fetchrow_array ) {
    my $pid = $row[1];
    my $id = $row[2];
    my $sth = $dbh->prepare("SELECT n1, n2, m1, m2 FROM msgs WHERE pid=$pid;");
    $sth->execute();
    if ( @row = $sth->fetchrow_array ) {
	my $n1 = decode_base64($row[0]);
	my $n2 = decode_base64($row[1]);
	my $m1 = decode_base64($row[2]);
	my $m2 = decode_base64($row[3]);
	print "\n\n{\"myid\":\"$id\"," .
	    "\"n1\":\"$n1\", \"n2\":\"$n2\"," . 
	    "\"m1\":\"$m1\", \"m2\":\"$m2\" " . 
	    "}\n";
    }
}
else {
    print("ERROR! Name '$name' not found!\n");
    exit 2;
}
