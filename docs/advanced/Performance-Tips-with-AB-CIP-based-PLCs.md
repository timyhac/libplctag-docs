---
sidebar_position: 6
# id: my-doc-id
# slug: /alternate-build-mingw-gnu
title: Performance Tips with AB CIP based PLCs
# description: My document description
---

# Performance Tips for AB CIP-based PLCs

Accessing PLCs can be difficult to do in a highly performant way.   PLCs often have very limited bandwidth or CPU power.   

For AB PLCs such as ControlLogix and CompactLogix, the key to higher performance using explicit messaging is to pack the requests into single packets and send those back and forth to the PLC.   This packing places multiple individual requests in one network packet.   The processing time of the packet is usually lower than the network latency.

As of the 2.0 version of the library, tag requests will be packed automatically where possible.   Currently this means only on ControlLogix and CompactLogix.   

Previous versions of the library required the use of threading or highly concurrent tag use to get maximum throughput.   The 2.0 series requires a different approach.   

The code in the [async.c](https://github.com/libplctag/libplctag/blob/master/src/examples/async.c) example shows how use of the asynchronous API can help with throughput.   In that code, all the tags are handled in stages.  First they are all created.  Then the reads are all queued at the same time, then status is checked, then the values are read out.   Queuing all the requests at once gives the library a chance to pack requests into packets.

