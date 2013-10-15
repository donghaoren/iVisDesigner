#!/usr/bin/python

execfile("version.py")

import datetime

today = datetime.date.today().strftime("%Y%m%d")

cmd = "git archive --format=tar.gz --prefix=iVisDesigner-%s/ -o dist/iVisDesigner-%s-%s-r%s.tar.gz HEAD" % \
    (IV_version, IV_version, today, IV_rev)
print cmd
commands.getoutput(cmd)
