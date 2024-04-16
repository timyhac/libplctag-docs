---
sidebar_position: 1
# id: my-doc-id
# slug: /my-custom-url
title: Welcome!
# description: My document description
---

# Welcome to the libplctag docs!

This library support communications between various types of PLCs (currently all from Rockwell/Allen-Bradley) and PC or PC-like systems. The library works under Linux, Windows on x86, x86-64, ARM and ARM64, and on macOS on x86-64 and ARM64. It has been known to run on OpenWRT and similar OSes with a little effort.

Please look over the examples in the src/examples directory in the repository for C code demonstrating many of the library's features. Other languages have their own projects within the libplctag GitHub organization.

Useful pages:
* [API](./API)
* [Tag string attributes](./Tag-String-Attributes)
* [History](./History)
* [C#/.Net wrapper](https://github.com/libplctag/libplctag.NET)
* [Java wrapper](https://github.com/libplctag/libplctag4j)
* [Julia wrapper](https://github.com/libplctag/PLCTag.jl)


:::danger[WARNING - DISCLAIMER]

Note: PLCs control many kinds of equipment and loss of property, production or even life can happen if mistakes in programming or access are made. Always use caution when accessing or programming PLCs!

We make no claims or warrants about the suitability of this code for any purpose.

Be careful!
:::

Have fun and let us know if this library is useful to you. Please send test cases if you run into bugs. As PLC hardware is fairly expensive, we may not be able to test out your test scenarios. If possible, please send patches. We do not ask that you transfer copyright over to us, but we do ask that you make any submitted patches under the same MPL 2.0/LGPL dual license we use. We will not take any patches under the GPL license or licenses that are incompatible with the our dual licenses.

We have a forum set up on Google Groups: [libplctag forum](https://groups.google.com/forum/#!forum/libplctag)

Thanks for looking at the library!