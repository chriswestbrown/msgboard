package Hasher;

use Digest::MD5 qw(md5 md5_hex md5_base64);

sub hasher #(pswd,salt,hashFlag)
{
    my $pswd = $_[0];    
    my $salt = $_[1];
    my $hashFlag = $_[2];
    my $tmp = $pswd;
    if ($hashFlag) # If we're in hash mode ... hash!
    { 
	####### This is how we did NTLM previously
	#my $comm = "echo -n '$pswd$salt' | iconv -f ISO-8859-1 -t UNICODELITTLE | openssl dgst -md4";
	#$tmp = `$comm`;
	#chop $tmp;
	$tmp = md5_hex($pswd.$salt);
    }
    return $tmp;
}

# a function for printing error messages
sub errPage {
print <<END;
Content-type: text/html;

<html><body>
<h1>Message Board Error</h1>
$_[0]
</body></html>

END
}

# Cookies are not allowed 
sub encodeCookie {
    $x = $_[0];
    $x =~ s/%/%25/g;
    $x =~ s/&/%26/g;
    $x =~ s/;/%3b/g;
    return $x;
}

sub decodeCookie {
    $x = $_[0];
    $x =~ s/%25/%/g;
    $x =~ s/%26/&/g;
    $x =~ s/%3b/;/g;
    return $x;
}

sub escapeit {
    $x = $_[0];
    $x =~ s/&/&amp;/g;
    $x =~ s/</&lt;/g; 
    $x =~ s/>/&gt;/g;
    return $x;
}

1;
