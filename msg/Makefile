def:	help status

help:	
	@echo "si110 simple message board"
	@echo "mbconf help - print help info"
	@echo "mbconf status - display currently set message board options"
	@echo "mbconf init - set to start-of-semester default"
	@echo "mbconf open - allows new posts and new account creation"
	@echo "mbconf new - allows new account creation"
	@echo "mbconf nonew - disallow creation of new accounts"
	@echo "mbconf clear - clears the contents of the board."
	@echo "mbconf clearaccts - clears accounts (except the first)."
	@echo "mbconf wipe - clears board and accounts (except first)."
	@echo "mbconf fullwipe - clears board and accounts completely!"
	@echo "mbconf lock - sets so only the first account can post."
	@echo "mbconf unlock - sets so any account can post."
	@echo "mbconf hash - sets board to use hashed passwords."
	@echo "mbconf nohash - sets board to store plain-text passwords."
	@echo "mbconf salt - sets board to use salted hashed passwords."
	@echo "mbconf nosalt - sets board to use unsalted passwords."
	@echo "mbconf escape - escapes < and > in posts for all but the first account"
	@echo "mbconf noescape - disables escaping of < and > characters everywhere"
	@echo "mbconf escapeall - like 'escape' except also escapes in user names"
	@echo "mbconf secure - secures message board by a. not allowing the"
	@echo "                the password file to be displayed, and b. not"
	@echo "                allowing internal (from rona) access to mb files"
	@echo "                and c. not showing mb.cgi source code."
	@echo "mbconf insecure - disables what 'secure' enables."
	@echo "NOTE: 'mbconf salt escapeall secure' is the most secure option."
	@echo "       'mbconf init' is the least secure option."


status:
	@echo "Current options are:"
	@ perl -e 'if (-e "nonew") { print "* new account creation is not allowed\n"; } else { print "* new account creation is allowed\n"; }'
	@ perl -e 'if (-e "lock") { print "* posting by non-instructors is not allowed\n"; } else { print "* posting by non-instructors is allowed\n"; }'
	@ perl -e 'if (-e "hash") { if (-e "salt") { print "* passwords are salted and hashed\n"; } else { print "* passwords are hashed, but not salted\n"; } } else { print "* passwords are stored in the clear\n"; }'
	@ perl -e 'if (-e "escape") { print "* < and > characters are escaped (except for instructor posts)\n"; } else { print "* < and > are not escaped\n"; }'
	@ perl -e 'if (-e "secure") { print "* the password file is inaccessible except to instructor and webserver\n"; } else { print "* the password file is accessible internally and via the webserver\n"; }'

init:	noescape insecure nohash fullwipe open
	chmod 755 newacct.cgi login.cgi mb.cgi .htaccess Hasher.pm pairings.cgi
	chmod 644 newacct.html login.html
	chmod 666 msgRAW pswd.txt mb.html
	chmod 711 .

open:	new unlock



clear:
	echo -n > msgRAW
	cat mb.empty.html > mb.html

clearaccts:
	head -1 pswd.txt > pswdFOO.txt
	cat pswdFOO.txt > pswd.txt
	rm -f pswdFOO.txt

wipe: clear clearaccts

fullwipe: clear
	echo -n > pswd.txt



new:
	rm -f nonew

nonew:
	touch nonew

lock:
	touch lock

unlock:
	rm -f lock

hash:	fullwipe
	touch hash

nohash: nosalt
	rm -f hash

salt:	hash
	touch salt

nosalt: fullwipe
	rm -f salt

escape:
	touch escape

escapeall: escape
	touch escapeuname

noescape:
	rm -f escape escapeuname

secure:
	touch secure
	rm -f mb.pl
	cat secure.htaccess base.htaccess > .htaccess
	chmod 644 .htaccess
	chmod 700 .
	setfacl -m u:www-data:rx .

insecure:
	rm -f secure
	/bin/cp -f mb.cgi mb.pl
	chmod 755 mb.pl
	perl cgi-hack.htaccess | cat - base.htaccess > .htaccess
	chmod 644 .htaccess
	chmod 711 .
