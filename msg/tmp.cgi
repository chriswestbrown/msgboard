#!/usr/bin/perl

########################################################
#
########################################################

# setup perl for good CGI use
use strict;
use CGI::Carp qw( fatalsToBrowser );
use CGI qw( :standard );

my $identity = `whoami`;

# Print the HTTP reply (which is mostly just the HTML)
# note: &#176; is unicode for the degree symbol
print <<END;
Content-type: text/html;

<html><body>
This is running as: ${identity}
</body></html>
END


