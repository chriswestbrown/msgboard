#!/usr/bin/perl
use DBI;
use MIME::Base64 qw(encode_base64);

# get name and message
my $name = encode_base64$ARGV[0];
my $msg = $ARGV[1];
my $emsg = encode_base64($msg);

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

    my $d = `date`;
    open(FH, '>', 'log') or die $!;
    print FH "UPDATE msgs SET 'm$id' = '$emsg' WHERE pid = $pid; <--- on $d\n";
    close(FH);
    
    my $sth = $dbh->prepare("UPDATE msgs SET 'm$id' = '$emsg' WHERE pid = $pid;");
    $sth->execute();
}
else {
    print("ERROR! Name '$name' not found!\n");
    exit 2;
}
