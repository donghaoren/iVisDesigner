#!/usr/bin/python

execfile("version.py")

cmd = "git archive --format=tar.gz --prefix=iVisDesigner-%s/ -o dist/iVisDesigner-%s-r%s.tar.gz HEAD" % (IV_version, IV_version, IV_rev)
print cmd
commands.getoutput(cmd)
