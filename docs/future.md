---
sidebar_position: 52
# id: my-doc-id
# slug: /alternate-build-mingw-gnu
title: Roadmap, Future Projects and Changes
# description: My document description
---

# Roadmap, Future Projects and Changes

This wiki page tracks larger projects and future work.  Many of these are refactoring or projects that do not change the functionality of the library, but do open up easier implementation of various features or increase portability.  The items below are roughly in priority order.

## Dummy Tags

See issue #392.  These are needed to kick-start the refactoring below.   The Modbus code is fairly clean, but still has a number of Modbus-specific elements.  Creating a new body of logic that simulates a PLC with delays and creates correct events will create a generic core that can be used as the base for other refactoring.   This is also a good place to test out and prove ideas around serdes and possible use of C++.

## Refactor CIP-Specific Code

The Modbus code uses a new flow of logic, based on the new event model, that simplifies many parts of the old logic:
* Memory allocation is only done once during the lifetime of a tag handle.
* Events (for external users) are much more clearly and cleanly handled without the spaghetti logic in lib.c for CIP now.
* The total amount of memory used is much, much less in heavily loaded systems.  There are no unbounded queues.
* It removes the need for a the tickler thread.

Another part of this refactor is to split out the various PLC types.  This will slightly increase code duplication until a second refactor can be done, but should enable more PLC-specific changes.  Support for Micro8x0 and Omron, in particular, is starting to clutter up the existing code.

The better memory handling and removal of a thread are key blockers for the library to run on smaller/embedded systems.  Finishing this refactor will unblock #68, #114 and #127 (at least).   It will also help with #88 somewhat as it cleans up and centralizes the state machine for each PLC.

The current plan is to start with PCCC PLCs and then see how easy it is to add large tag support.

## Portability Enhancements

After the refactor is done, there are some aspects of the CIP code (in particular) that need to be redone.   Currently, packed structs are used but those are borderline UB for C with non-aligned values.  There are areas where pointers are used but there is no guarantee that the values are aligned for variable-length parts of the payloads as well.   

Hand-rolled serdes is one possibility.  This worked fairly well in the simulator, but needs another round of clean up and thought.   It would also enable a reduction in copying if the slice code is reused.

The event core needs to be examined carefully to make sure it runs on platforms such as NuttX and FreeRTOS.

## PCCC Large Tag Support

PCCC large tags are not supported directly today.   With the new structure from the refactor and the changed serdes, this should be easier to handle.  This is a significant gap in functionality today.

## Omron-Specific Enhancements

Omron has a number of Omron-specific CIP commands and restrictions.   The aphytcomm Python project seems to implement much of what we need and can possibly be mined for ideas and protocol elements.

## S7 Support

This was highly desired by users.  Depends on refactoring and portability enhancements.

## CIP-Based PLC Discovery

Issue #47.   CIP does allow for PLC discovery.  However, this requires use of UDP (for broadcast) which is not at all supported in the platform code, yet.   

* First UDT support needs to be added to the platform code on all platforms.
* This will require a bit of a rethink of how responses are handled.   Responses to queries like this can be extremely delayed (seconds).  We need to be able to route responses based on internal ID/sequence tracking as we might have more than one request in flight.