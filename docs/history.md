---
sidebar_position: 50
# id: my-doc-id
# slug: /alternate-build-mingw-gnu
title: History
# description: My document description
---

We were tired of poor quality, expensive and non-portable OPC implementations.
Actually, we were tired of OPC.  It is a large protocol and provides
far more functionality than we need.  It is also not portable since it is
based on Microsoft's OLE.  We
looked around to find an open-source library that would provide the 20% of
functionality of PLC access we needed to do 100% of our work.  We found some
very old and abandoned libraries for PCCC (AB's older protocol) and just one
EIP/CIP library, also apparently abandoned, that was marginally portable: TuxEIP.

TuxEIP was written by a company (probably in France based on the
email addresses and names) which seems to have disappeared off of the Internet.  The library's
original home site was long gone (still available via the Internet Archive).
It was only used as slightly patched version in the pvbrowser project.

([TuxEIP/TuxPLC](https://github.com/leicht/TuxPLC) can be found on Github now!)

We set about seeing if we could use the code.  We ran into some problems:

* the code was GPL.  That is too restrictive for us and our customers.  While we always
provide code with our projects, we needed more options than allowed by
the GPL.
* the code, while officially at 1.0, was not really finished.  It was not clear
which parts were fully functional and which were not.  Basic read/write access
of tags was fairly strong.  There was code that appeared to
be designed to dig deep into AB PLCs. We did not need most of the code.
* the code was only marginally portable.  Significant work would have to be
done to make it safe for other systems than 32-bit little-endian Linux.  The
pvbrowser project did some small patches to get it to compile with MinGW
on Windows, but it would not get very far with Visual Studio C/C++.  We tried.
* the code was organized such that it would be complicated to wrap for use in
Python or other languages.   We did a small preliminary Python wrapper for a
part of it.  It took a while and we were not very happy with it.  Raw pointers just
do not translate well.
* the code did not hide the intricacies of the EtherNet/IP (CIP) protocol, but
made application logic deal with them.
* the code had a lot of calls to malloc/free that made us nervous about both
memory use and memory leaks.
* the code was clearly abandoned hence we were on our own for patches and
support.

We tried for a while to find the original authors, but were not able to find them.
Our hope was to offer to take over the library in return for changing the license
to either the LGPL or BSD License.  The TuxEIP authors appear to have had access
to documentation about the CIP protocol as they reference sections and specific
points in the documents inside their code.  We do not have this access.

We decided to write our own library.  In looking at how TuxEIP worked, we made
the discovery that the AP protocol packets are not as dynamically sized as the
TuxEIP code makes it seem.  It turns out that there are a few basic complete
packets with one dynamically sized part at the end.  We were able to make our code a lot
simpler and almost completely remove dynamic memory allocation from the library during
normal operation.  Note that this means we definitely do **not** support the whole CIP protocol!

We copied no code from TuxEIP.  Those areas that are similar are due to the
necessities of coding the correct binary packet format.  Where we had no other
source, we tend to use the same element names as in TuxEIP where they appear to
correspond with some named construct that is part of the actual CIP specification
(at least that is what we thought was happening since we do not have that specification).
Where we had no clue, we made names up to fit what we thought was going on.

We could only find a few tidbits of free information on the Internet about how
the various layers of the EtherNet/IP (CIP) protocol(s) work.  There are several
layers to the whole thing.  Luckily, TuxEIP had already blazed that trail and
we were able to examine that code to find out how things worked.

The EtherNet/IP (as part of CIP) protocol specification is very large and very complicated
and covers several generations of Rockwell/Allen-Bradley PLCs.  Parts of it
date to systems that AB built before Ethernet was common and proprietary
networks like serial Data Highway were all that was around.

As we started our work on the library, we realized that it would be possible to
write a higher-level API that would handle all the protocol-specific parts of
basic read/write PLC communication.  We changed our library API again and started
that work.  That is what resulted in this project.

None of this could have happened without the hard work that the authors of
TuxEIP did before us.  Thanks!
