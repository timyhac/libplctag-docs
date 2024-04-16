---
sidebar_position: 10
# id: my-doc-id
# slug: /alternate-build-mingw-gnu
title: String Handling
# description: My document description
---

# String Handling

:::warning Warnings
Strings are challenging in many PLC environments. Every PLC seems to have different definitions of strings and how they are laid out in memory.

**Getting the definitions for a string value incorrect can result in data overwrites or corrupted data within a tag!**
:::

## Library String Support

The libplctag library tries to make this situation less painful with a set of default definitions that handle the most common cases on old PCCC-based PLCs such as PLC/5, SLC 500 and MicroLogix. [Special functions in the API](./#handling-strings) work with these definitions to make string handling much less painful, particularly in the case of arrays of string or string embedded within other UDTs.  This combination of special attributes and generic functions allows application code to be simpler in most of the common cases.

The following are supported without explicit definitions in the tag attribute string:

* PLC/5 strings.   The defaults provide for a 2-byte count word followed by a fixed buffer of 82 character bytes.
* SLC 500.  As for PLC/5.
* MicroLogix.   As for PLC/5 but with the added complication that string data is sent as words (INT or 16-bit chunks) and those are sent in big-endian order.   Thus each two bytes is swapped from the ordering you would expect.  This is handled by the default string definitions and you do not need to do anything to support this.
* Control/CompactLogix:
   * Standard tag types get defaults that support STRING data.   This is the standard string type used when you create a tag or UDT field with type STRING.   These have a 4-byte count word followed by 82 bytes of character data followed by 2 bytes of padding.
   * tag listing tag names.   These are used when using the magic `@tags` tag.   These are variable length and have a 2-byte count word followed by the contents of the string.  They are not terminated with anything.
   * UDT name and UDT field names.   These are used when using the magic `@UDT/xyz` tag.   These are variable length and conform to C string definitions.  They have no count word and are terminated with a nul character byte.

Modbus tags do not have any default string definitions.  If you call the string API functions, they will return an error if you have not provided a definition for strings.  See the [section on the API for strings](/API#handling-strings) and the [optional tag attributes for strings](/Tag-String-Attributes#optional-generic-string-attributes) for definitions.

## User-defined String-like UDTs

Control/CompactLogix systems allow users to create user defined data structures.   One way people use this is to create string-like UDTs that have a different length of character data (or sometimes both the count word and character data).  The default values are as follows for standard CIP-based Allen-Bradley strings:

- **str_count_word_bytes=4** -- the count word is a DINT
- **str_is_byte_swapped=0** -- the string character bytes are in normal order
- **str_is_counted=1** -- the string type has a count word
- **str_is_fixed_length=1** -- the string is a fixed size
- **str_is_zero_terminated=0** -- the string is not nul-terminated as C strings are
- **str_max_capacity=82** -- the string can have 82 bytes of characters
- **str_pad_bytes=2** -- the string has two bytes of padding characters
- **str_total_length=88** -- the string occupies 88 bytes in the tag data buffer

As long as the count word is the same size and in the same place, you can generally use the defaults to read a string, **but you should not do this!**   However, if you try to write such a string-like value, the function call to set the string value will usually fail.  The library still thinks that the string is 82 characters long with 2 bytes of padding.  **Trying to write a string tag using the wrong definitions can result in data overwrites within a larger tag (if the string is a field within a larger UDT for instance), so make sure you are using the correct definitions!**

For a user-defined string that uses a 4-byte count word (DINT) and has 12 bytes of character data, those settings should be different.  You can use the optional tag attributes to set these values:

- str_count_word_bytes=4 -- the count word is a DINT
- str_is_byte_swapped=0 -- the string character bytes are in normal order
- str_is_counted=1 -- the string type has a count word
- str_is_fixed_length=1 -- the string is a fixed size
- str_is_zero_terminated=0 -- the string is not nul-terminated as C strings are
- **str_max_capacity=12** -- the string can have 12 bytes of characters
- **str_pad_bytes=0** -- the string has zero bytes of padding characters
- **str_total_length=16** -- the string occupies 16 bytes in the tag data buffer

The three highlighted ones (the last three) are the only ones you need to add to the tag string if your special string-like UDT uses a DINT as the count word.   The padding bytes are set to zero because the total string length (count word plus string character bytes) is 16 which is divisible by 4 (four).  Control/CompactLogix systems pad all UDT sizes to a multiple of four bytes.

To illustrate the padding requirements, here is the definition for a string with a 4-byte count word and 10 bytes of character data.   Only the non-default values are shown.

- **str_max_capacity=10** -- the string can have 10 bytes of characters
- **str_pad_bytes=2** -- the string has two bytes of padding characters
- **str_total_length=16** -- the string occupies 16 bytes in the tag data buffer

The string will be 16 bytes long and there will be 2 padding bytes.   Note that when you make your own string UDTs, you should calculate the size of the resulting UDT and make sure that you do not waste space in padding.

