---
sidebar_position: 3
# id: my-doc-id
# slug: /my-custom-url
title: Bit and Boolean Handling
# description: My document description
---

# Bit and Boolean Handling

:::warning Warnings
Every PLC (and even every value type!) seems to have a different way of handling booleans and bit values.
:::

## Library Bit and Boolean Support

The libplctag library tries to make this situation less painful with a set of data accessor functions that make 
it easier to access bit or boolean values.  However, you still need to know what the PLC is going to send you and
what you are going to send it when writing a tag.

## Bits in a Word

Using the `plc_tag_get_bit()` and `plc_tag_set_bit()` functions you can get or set a single bit in a tag's
data buffer.  The size of the buffer is the size of the tag.  *Note that when you update a single bit in a
tag and then write that tag back to the PLC, you write the _entire_ tag!*

## Booleans

Boolean values are trickier.   There are many values that can be treated as booleans.  Words, bytes and single
bits all are treated as booleans in PLCs.   Some tag types such as coils in Modbus PLCs and BOOL in Allen-Bradley
and Omron PLCs represent single values.   Here are some different implementations:

* Coils in Modbus.   These are single bits but are represented as a single byte value in the tag.  Set the value to 0 or 0xFF.
* The B data file in PCCC PLCs.   In PLC/5, SLC-500 and MicroLogix PLCs, the B data file contains booleans.  These are really just word (16-bit) values and each bit is a boolean flag.   If you read an element of the data file, `B3:4`, you get a 16-bit word back.  Writing it will overwrite all 16 of the bits/booleans in it.
* BOOL tags in ControlLogix, CompactLogix and Omron.   These are stored and transfered as single bytes.  
* BOOL arrays in ControlLogix, CompactLogix and Omron.  These are stored and transfered as arrays of 32-bit values.  The total number of bits in the array will be a multiple of 32.   Each bit is a single BOOL.  Accessing the array is _NOT_ obvious.   Unlike other tags, the array index is the index of the 32-bit word, not the index of the bit.   So a tag with a name like `myBoolArray[3]` will access the 4th 32-bit word or bits 96-127, all counting from zero.
* BOOL fields in UDTs in ControlLogix, CompactLogix and Omron.   These are stored as single bits in hidden USINT (single byte) fields in the UDT.   You need to look at the UDT definition (see the list_tags_logix.c program for an example of how to get this data) to find out the offset in the UDT of the hidden field and the offset of the bit in that hidden field.

## Bit Tags

The library understands common notation to indicate that you are accessing a single bit in a tag.  

PLC/5, SLC-500 and MicroLogix examples:
* B3:0/4 - access bit 4 (the _fifth_ bit counting from zero) in data file 3, word 0.
* N7:13/9 - access bit 9 (the _tenth_ bit counting from zero) in data file 7, word 9.
* L19:4/28 - access bit 28 in data file 19, double word 4.

The special `/x` syntax tells the library that this is a single bit tag.   The rest of the tag name tells the library and the PLC where that bit is found.

ControlLogix, CompactLogix and Omron examples:
* myDINTag.4 - access bit 4 (counting from zero) in the tag.

These tags are treated specially by the library.   They become _bit tags_.   Only the single bit indicated
is used.   Using _any_ of the data accessors to set or get the value of the tag results in reading either 1 or 0,
or writing a 1 or 0 to the bit.  When such a tag is written to the PLC, a mask is sent that sets the single bit
to 0 or 1 but leaves all other bits alone.  Thus writing to `B3:0/7` is safe as it will only update bit 7.

When using a non-bit data accessor to write a value, the only values that matter are zero and non-zero.  Calling `plc_tag_set_int16(tag_id, 0, 42)` on a bit tag will set the bit value to 1.  Calling `plc_tag_get_int16(tag_id, 0)`  will return 1 if the bit is set and 0 if it is not set.

