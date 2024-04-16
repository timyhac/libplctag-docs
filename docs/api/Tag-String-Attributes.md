---
sidebar_position: 11
# id: my-doc-id
# slug: /alternate-build-mingw-gnu
title: Tag String Attributes
# description: My document description
---

# Tag String Attributes

The tag types support various attributes. **Note** that attributes (and values) are case-insensitive unless otherwise noted.It is important to get these attributes as accurate as possible.   Certain features or specializations of the protocol are turned on or off depending on the specific attributes.

**Unless specifically stated otherwise, tag attribute names and values are case-insensitive.**

## Generic Attributes

### Required Generic Attributes

Valid as of version **2.5.0**.

| Attribute | Value | Notes |
| --------- | ----- | ----- |
| protocol | **Required** `ab_eip` or `ab-eip` for Allen-Bradley PLCs and `modbus-tcp` or `modbus_tcp` for Modbus TCP PLCs. | Determines the type of the PLC protocol.|

### Optional Generic Attributes

| Attribute | Value | Notes |
| --------- | ----- | ----- |
| debug | **Optional** 0-5 | An integer defining the current debugging level. Level ranges from 1 providing only hard error outputs to 5 providing very detailed outputs of all aspects of the library's actions.  Usually 3 or 4 are more useful.   Defined in the C header as `PLCTAG_DEBUG_ERROR` (1), `PLCTAG_DEBUG_WARN` (2) , `PLCTAG_DEBUG_INFO` (3), `PLCTAG_DEBUG_DETAIL` (4), `PLCTAG_DEBUG_SPEW` (5), with `PLCTAG_DEBUG_NONE` (0) used to turn off all debugging.   Defaults to `PLCTAG_DEBUG_NONE` (0). |
| elem_count | **Optional** An integer number of elements per tag | All tags are treated as arrays.   Tags that are not arrays are considered to have a length of one element.  This attribute determines how many elements are in the tag. Defaults to one (1) if not found. |
| elem_size | **Optional/Required** An integer number of bytes per element | This attribute determines the size of a single element of the tag.  Modbus PLCs do not need this as the register type defines the size.   Some Allen-Bradley PLCs (generally Logix-class PLCs) do not require this attribute.  Some PLCs do.  Please look at the PLC-specific sections for more detail. |
| read_cache_ms | **Optional** An integer number of milliseconds to cache read data. | Use this attribute to cause the tag read operations to cache data the requested number of milliseconds.   This can be used to lower the actual number of requests against the PLC.  Example read_cache_ms=100 will result in read operations no more often than once every 100 milliseconds. |

### Optional Generic Byte-order Attributes

These attributes control how the library interprets the binary data sent from and to the PLC.   Generally the defaults are correct.   However, if you are using a PLC that is not directly supported, you may need to set some of these to get correct results.

| Attribute | Value | Notes |
| --------- | ----- | ----- |
| int16_byte_order | **Optional** A string indicating the byte order of 16-bit integers. | Allowable values include `01` (little-endian) and `10` (big-endian).  Defaults to `10` for Modbus and `01` for Allen-Bradley.|
| int32_byte_order | **Optional** A string indicating the byte order of 32-bit integers. | Defaults to `3210`, strict big-endian, for Modbus and `0123` for Allen-Bradley PLCs. |
| int64_byte_order | **Optional** A string indicating the byte order of 64-bit integers. | Defaults to `76543210`, strict big-endian, for Modbus and `01234567` for Allen-Bradley PLCs. |
| float32_byte_order | **Optional** A string indicating the byte order of 32-bit floating point values. | Defaults to `3210`, strict big-endian, for Modbus. Allen-Bradley PLCs default to the PLC-native order. |
| float64_byte_order | **Optional** A string indicating the byte order of 64-bit floating point values. | Defaults to `76543210`, strict big-endian, for Modbus. Defaults to `01234567` for Allen-Bradley PLCs. |

### Optional Generic String Attributes

These attributes control how string data is interpreted.  The defaults generally work for standard types.   Modbus does not have defaults.  If you want to use the string API functions for a Modbus PLC, you will need to set these.   Rockwell/Allen-Bradley PLCs have defaults that work with standard types.   If you create your own string-like UDTs on Control/CompactLogix systems, you will need to provide the correct string definitions to the library in tag attribute strings for tags that access strings.   **You must do this if you use your own UDT definitions otherwise data corruption and overwrite may be possible!**

| Attribute | Value | Notes |
| --------- | ----- | ----- |
| str_count_word_bytes | **Optional** A positive integer value of 1, 2, 4, or 8 determining how big the leading count word is in a string. | Defaults are set per PLC type.  AB Logix PLCs default to 4.  AB PCCC PLCs default to 2.   Must be used with **_str_is_counted_**. |
| str_is_byte_swapped | **Optional** A boolean (1 for true, 0 for false) determining whether character bytes are swapped within 16-bit words. | Defaults are set per PLC type.  AB Logix PLCs default to 0 (false) and PCCC PLCs default to 1 (true). |
| str_is_counted | **Optional** A boolean (1 for true, 0 for false) determining whether strings have a count word or not. | Defaults are set per PLC type.   AB PLCs default to 1 (true).  If set true, must be used with **_str_count_word_bytes_**. |
| str_is_fixed_length | **Optional** A boolean (1 for true, 0 for false) determining whether strings have a fixed length that they occupy. | Defaults are set per PLC and tag type.   AB defaults to 1 (true) for ControlLogix and CompactLogix and 84 for PCCC-based PLCs.  Listing tags is an exception as the tag names are counted, but not fixed length. |
| str_is_zero_terminated | **Optional** A boolean (1 for true, 0 for false) determining whether strings are zero-terminated as is done in C. | Defaults are set per PLC type.  AB defaults to 0 (false). |
| str_max_capacity | **Optional** A positive integer value determining the maximum number of character bytes in a string.  | Defaults are set per PLC type.  AB Logix and PCCC PLCs default to 82. |
| str_pad_bytes | **Optional** A positive integer value determining the total number of padding bytes at the end of a string. | Defaults are set per PLC type.   AB Logix PLCs default to 2.   AB PCCC PLCs default to 0. |
| str_total_length | **Optional** A positive integer value determining the total number of bytes used in the tag buffer by a string.   Must be used with **_str_is_fixed_length_**. | Defaults are set per PLC type.   AB Logix PLCs default to 88.  AB PCCC PLCs default to 84. |

### Optional Generic Auto-Sync Attributes

| Attribute | Value | Notes |
| --------- | ----- | ----- |
| auto_sync_read_ms | **Optional** An integer number of milliseconds to periodically read data from the PLC. | Use this attribute to automatically read data from the PLC on a set interval. This can be used in conjunction with the `PLCTAG_EVENT_READ_STARTED` and `PLCTAG_EVENT_READ_COMPLETED` events to respond to the data updates. |
| auto_sync_write_ms | **Optional** An integer number of milliseconds to buffer tag data changes before writing to the PLC. | Use this attribute to automatically write data to the PLC a set duration after setting its value. This can be used to lower the actual number of write operations by locally buffering local writes, and only writing to the PLC the most recent one when the wait completes.  You can determine when a write starts and completes by catching the `PLCTAG_EVEN_WRITE_STARTED` and `PLCTAG_EVENT_WRITE_COMPLETED` events with a callback. |

The two attributes `auto_sync_read_ms` and `auto_sync_write_ms` control automatic reading and writing of tags providing a level of transparent operation.  Using these you can avoid most use of `plc_tag_read()` and `plc_tag_write()`.  You should continue to check `plc_tag_status()` from time to time or use callbacks to capture the status asynchronously.  Note that the underlying operating system controls how long threads run and how long a thread may wait before getting CPU time.  It is important to make sure that your platform, network and PLC will support your requested read period or write wait time.  Values under 10-20ms will probably not work well.

Use of auto-sync is not appropriate for all uses.   When it can be used, it can simplify application code.

Setting `auto_sync_read_ms` will cause the tag to automatically update every `auto_sync_read_ms` period.  The library will make a best effort attempt to read the PLC's value for the tag each period.  If the tag is being read for the first time, the size of the tag may change as the the data responses are received.  Read data is copied into the tag buffer as it comes in from the PLC.  **You may see partially read tag data if you are accessing the tag at the same time new responses are received.**  Note that such data _tearing_ can occur when the PLC's network module reads a large tag as the PLC program is modifying it as well, so this is a problem that will occur even if auto-sync is not used.

Writes are handled in a different way.  Setting a value using one of the `plc_tag_set_X()` functions will mark the tag as needing to be written to the PLC.  Instead of writing immediately, the library will wait at least `auto_sync_write_ms` before writing out the tag value.  Writes are only done when the value of the tag was possibly changed, not periodically!

The delay allows the user program to do multiple changes to a tag before they get written out.  Updating a tag value automatically prevents any new reads from running and will abort any read in flight to prevent the new tag value from being overwritten until the write completes.  Using larger values of `auto_sync_write_ms` will allow the library to do more write combining and lower the number of writes to the PLC.

Each of these attributes may be used independently.   You can set up a tag that only does automatic reading but requires explicit calls to trigger writes.  You can set up a tag that does automatic writes but requires explicit calls to `plc_tag_read()` to retrieve the PLC value.

## AB-Specific Attributes

### Required AB-Specific Attributes

| Attribute | Value | Notes |
| --------- | ----- | ----- |
| cpu | **deprecated** see `plc` attribute | Determines the type of the PLC. |
| gateway | **Required** IP address or host name | This tells the library what host name or IP address to use for the PLC or the gateway to the PLC (in the case that the PLC is remote). |
| elem_size | **Required/Optional** A positive integer number of bytes per tag element | Only **required** for some PLC types. Generally not required as of version 2.4.0 |
| name | **Required** the full name of a tag, e.g. `TestBigTag[10,42]` for CIP-based PLCs. | This is the full name of the tag.  For CIP-based PLCs, to access program tags, prepend `Program:<program name>.` where `<program name>` is the name of the program in which the tag is created. Example: `Program:MyProgram.MyTag`.  This will access the tag `MyTag` in the program `MyProgram`.  For PCCC-based PLCs, examples include `N7:4`, `ST18:26`, `L20:2`, `B3:4/2`, `MG14:6.en` etc.  Many common field name abbeviations are supported. |
| path | **Required/Optional** Only for PLCs with additional routing | This attribute is **required** for CompactLogix/ControlLogix tags and for tags using a DH+ protocol bridge (i.e. a DHRIO module) to get to a PLC/5, SLC 500, or MicroLogix PLC on a remote DH+ link.  The attribute is ignored if it is not a DH+ bridge route, but will generate a warning if debugging is active.  Note that Micro800 connections must **not** have a path attribute. |
| plc | **Required** **preferred** Determines the type of the PLC | See the table below for options. |
|  | controllogix | **preferred** Tell the library that this tag is in a Control Logix-class PLC. |
|  | lgx | _deprecated_ synonym for `controllogix` |
|  | logix | _deprecated_ synonym for `controllogix` |
|  | contrologix | _deprecated_ synonym for `controllogix` |
|  | compactlogix | _deprecated_ synonym for `controllogix` |
|  | clgx | _deprecated_ synonym for `controllogix` |
|  | plc5 | **preferred** Tell the library that this tag is in a PLC/5 PLC. |
|  | plc | _deprecated_ synonym for `plc5` |
|  | slc500 | **preferred** Tell the library that this tag is in a SLC 500 PLC. |
|  | slc | _deprecated_ synonym for `slc500` |
|  | logixpccc | **preferred** Tell the library that this tag is in a Control Logix-class PLC using the PLC/5 protocol. |
|  | lgxpccc | _deprecated_ synonym for `lgxpccc` |
|  | lgxplc5 | _deprecated_ synonym for `lgxpccc` |
|  | lgx-pccc | _deprecated_ synonym for `lgxpccc` |
|  | logix-pccc | _deprecated_ synonym for `lgxpccc` |
|  | lgx-plc5 | _deprecated_ synonym for `lgxpccc` |
|  | micro800 | **preferred**  Tell the library that this tag is in a Micro800-class PLC. |
|  | micrologix800 | _deprecated_ synonym for `micrologix800` |
|  | mlgx800 | _deprecated_ synonym for `micrologix800` |
|  | micrologix | **preferred** Tell the library that this tag is in a Micrologix PLC. |
|  | mlgx | _deprecated_ synonym for `micrologix` |
|  | omron-njnx | **preferred** Tell the library that this tag is in an Omron NJ/NX PLC. |

### Optional AB-Specific Attributes

| Attribute | Value | Notes |
| --------- | ----- | ----- |
| use_connected_msg | **Optional** 1 = use CIP connection, 0 = use UCMM | Control whether to use connected or unconnected messaging.  Only valid on Logix-class PLCs.   Connected messaging is required on Micro800 and DH+ bridged links.  Default is PLC-specific and link-type specific.  Generally you do not need to set this. This defaults to `1` (true) for PLCs that support it. |
| allow_packing |  **Optional** 1 = (default) allow use of multi-request CIP command, 0 = use only one CIP request per packet. | This is specific to individual PLC models.   Generally only Control Logix-class PLCs support it.  It is the default for those PLCs that support it as it greatly increases the performance of the communication channel to the PLC. |

## Modbus-Specific Attributes

| Attribute | Value | Notes |
| --------- | ----- | ----- |
| **gateway** | **Required** IP address or host name and optional port | This tells the library what host name or IP address to use for the PLC.  Can have an optional port at the end, e.g. `gateway=10.1.2.3:502` where the `:502` part specifies the port. |
| **name** | **Required** the type and first register number of a tag, e.g. `co42` for coil 42 (counts from zero). | The supported register type prefixes are `co` for coil, `di` for discrete inputs, `hr` for holding registers and `ir` for input registers.  The type prefix must be present and the register number must be greater than or equal to zero and less than or equal to 65535. Modbus examples: `co21` - coil 21, `di22` - discrete input 22, `hr66` - holding register 66, `ir64000` - input register 64000. |
| **path** | **Required**  The server/unit ID.  Must be an integer value between 0 and 255. | Servers may support more than one unit or may bridge to other units. Example: `path=4` for accessing device unit ID 4. |
