---
sidebar_position: 2
# id: my-doc-id
# slug: /alternate-build-mingw-gnu
title: C API Documentation
# description: My document description
---

# C API Documentation (v2.5.0)

This page describes the C API.  Please see the examples directory in the source for code.

A tag is a named data element in a PLC.  Use of the term _named_ might be a little strong.  Some protocols use numbered data files or just numbered register addresses.  Older PLCs such as AB PLC/5, SLC and MicroLogix use a form of logical addressing.

The library provides access to individual tags _or fields within them_ with PLCs.  The tag is the fundamental unit that the library uses.   The PLCs themselves are not represented directly in the library API.   This is to easier support applications that need to monitor and manipulate data across a network of PLCs.

Tags are treated like arrays.  A tag that contains a single data element is treated like an array of size one.

## Tag Model

Before describing the concrete parts of the API a brief explanation of the model is needed.   The library models each tag, or field within a tag, as an individual handle that your program can use.   There is no exposed concept of a PLC.  Just tags.

A tag is a local reference to a region of PLC memory.  Depending on the PLC type and protocol the region may be named. For some protocols, the region is simply a type and register number (e.g. Modbus).  For other protocols, it is a name, possible array element, field names etc. (e.g. a CIP-based PLC).

The library provides functions to retrieve and set the values in the PLC's memory as well as many functions to extract and set specific data elements within a tag.  Note that a tag may not correspond directly to a named area in a PLC.  For instance, `MyNiftyArray[14]` with a length of 2 elements will get elements `MyNiftyTag[14]` and `MyNiftyTag[15]` from the tag `MyNiftyTag`.  Tags are referenced by an integer (32-bit) tag handle.

Tag handles are designed to be very long lived.   They can live weeks or months.   In order to use the library to its full potential, it is important to note this.   Setting up and tearing down connections to a PLC are the heaviest operations possible.   They take significant time and multiple packets to handshake the connection set up.  The library automatically closes PLC connections after periods of no use (typically five seconds) and automatically reopens them when you try to do something with a tag handle.

**Performance Tip:** Avoid creating and destroying tags often.

Your program directly controls the lifetime of a handle.   It opens a handle to a PLC tag through the `plc_tag_create()` function and frees the resources used with the `plc_tag_destroy()` function.   All other resources are handled internally within the library.  The limit on tag handle IDs is on the order of several hundred million.  You will likely run into system constraints such as available memory, network bandwidth and CPU long before exhausting the internal limits of the library.

The lowest level of access to a tag is via the `plc_tag_read()` and `plc_tag_write()` operations.   In most cases you must explicitly call these functions to write to the PLC or read from the PLC.   There are also attributes that can be passed when creating a tag handle to make it either automatically write to the PLC when the local copy of the tag is updated or read from the PLC periodically, or both.  See the wiki page on [auto sync tag string attributes](https://github.com/libplctag/libplctag/wiki/Tag-String-Attributes#auto-sync) for more information.

## Status Codes

Most functions return a status code.   It will be one of the following (the numeric value is given in parentheses):

| Error Code                   | Value | Description                                                                                         |
|------------------------------|-------|-----------------------------------------------------------------------------------------------------|
| `PLCTAG_STATUS_PENDING`      | 1     | Operation in progress. Not an error.                                                                |
| `PLCTAG_STATUS_OK`           | 0     | No error. The operation was successful or the state of the tag is good.                             |
| `PLCTAG_ERR_ABORT`           | -1    | The operation was aborted.                                                                          |
| `PLCTAG_ERR_BAD_CONFIG`      | -2    | The operation failed due to incorrect configuration. Usually returned from a remote system.         |
| `PLCTAG_ERR_BAD_CONNECTION`  | -3    | The connection failed for some reason. This can mean that the remote PLC was power cycled, for instance. |
| `PLCTAG_ERR_BAD_DATA`        | -4    | The data received from the remote PLC was undecipherable or otherwise not able to be processed. Can also be returned from a remote system that cannot process the data sent to it. |
| `PLCTAG_ERR_BAD_DEVICE`      | -5    | Usually returned from a remote system when something addressed does not exist.                      |
| `PLCTAG_ERR_BAD_GATEWAY`     | -6    | Usually returned when the library is unable to connect to a remote system.                          |
| `PLCTAG_ERR_BAD_PARAM`       | -7    | A common error return when something is not correct with the tag creation attribute string.         |
| `PLCTAG_ERR_BAD_REPLY`       | -8    | Usually returned when the remote system returned an unexpected response.                            |
| `PLCTAG_ERR_BAD_STATUS`      | -9    | Usually returned by a remote system when something is not in a good state.                          |
| `PLCTAG_ERR_CLOSE`           | -10   | An error occurred trying to close some resource.                                                    |
| `PLCTAG_ERR_CREATE`          | -11   | An error occurred trying to create some internal resource.                                          |
| `PLCTAG_ERR_DUPLICATE`       | -12   | An error returned by a remote system when something is incorrectly duplicated (i.e. a duplicate connection ID). |
| `PLCTAG_ERR_ENCODE`          | -13   | An error was returned when trying to encode some data such as a tag name.                           |
| `PLCTAG_ERR_MUTEX_DESTROY`   | -14   | An internal library error. It would be very unusual to see this.                                    |
| `PLCTAG_ERR_MUTEX_INIT`      | -15   | As above.                                                                                           |
| `PLCTAG_ERR_MUTEX_LOCK`      | -16   | As above.                                                                                           |
| `PLCTAG_ERR_MUTEX_UNLOCK`    | -17   | As above.                                                                                           |
| `PLCTAG_ERR_NOT_ALLOWED`     | -18   | Often returned from the remote system when an operation is not permitted.                           |
| `PLCTAG_ERR_NOT_FOUND`       | -19   | Often returned from the remote system when something is not found.                                  |
| `PLCTAG_ERR_NOT_IMPLEMENTED` | -20   | Returned when a valid operation is not implemented.                                                 |
| `PLCTAG_ERR_NO_DATA`         | -21   | Returned when expected data is not present.                                                         |
| `PLCTAG_ERR_NO_MATCH`        | -22   | Similar to NOT_FOUND.                                                                               |
| `PLCTAG_ERR_NO_MEM`          | -23   | Returned by the library when memory allocation fails.                                               |
| `PLCTAG_ERR_NO_RESOURCES`    | -24   | Returned by the remote system when some resource allocation fails.                                  |
| `PLCTAG_ERR_NULL_PTR`        | -25   | Usually an internal error, but can be returned when an invalid handle is used with an API call.     |
| `PLCTAG_ERR_OPEN`            | -26   | Returned when an error occurs opening a resource such as a socket.                                  |
| `PLCTAG_ERR_OUT_OF_BOUNDS`   | -27   | Usually returned when trying to write a value into a tag outside of the tag data bounds or reading a value outside of the tag data bounds. |
| `PLCTAG_ERR_READ`            | -28   | Returned when an error occurs during a read operation. Usually related to socket problems.          |
| `PLCTAG_ERR_REMOTE_ERR`      | -29   | An unspecified or untranslatable remote error causes this.                                          |
| `PLCTAG_ERR_THREAD_CREATE`   | -30   | An internal library error. If you see this, it is likely that everything is about to crash.         |
| `PLCTAG_ERR_THREAD_JOIN`     | -31   | Another internal library error. It is very unlikely that you will see this.                         |
| `PLCTAG_ERR_TIMEOUT`         | -32   | An operation took too long and timed out.                                                           |
| `PLCTAG_ERR_TOO_LARGE`       | -33   | More data was returned than was expected.                                                           |
| `PLCTAG_ERR_TOO_SMALL`       | -34   | Insufficient data was returned from the remote system.                                              |
| `PLCTAG_ERR_UNSUPPORTED`     | -35   | The operation is not supported on the remote system.                                                |
| `PLCTAG_ERR_WINSOCK`         | -36   | A Winsock-specific error occurred (only on Windows).                                                |
| `PLCTAG_ERR_WRITE`           | -37   | An error occurred trying to write, usually to a socket.                                             |
| `PLCTAG_ERR_PARTIAL`         | -38   | Partial data was received or something was unexpectedly incomplete.                                 |
| `PLCTAG_ERR_BUSY`            | -39   | The operation cannot be performed as some other operation is taking place.                          |

### Printing Status Codes

Use the `plc_tag_decode_error()` API function to print out status codes.   It just translates the status code above to the string equivalent.

```c
const char *plc_tag_decode_error(int err);
```

The string returned is a static C-style string. You may copy it, but do not attempt to free it in your program.

***

## Versions and Checking Library Compatibility

The libplctag code guarantees compatibility across versions within some limits.  The version of the library breaks down into three parts:

- A major version.   This indicates a high level API version.   Different major version are _not_ guaranteed to be compatible with each other.   There has been only one such change in the history of libplctag.
- A minor version.   This indicates an API feature level.   Addition of new API features will come with a higher minor version.   API features are never removed on a minor version bump.  We hold the guarantee that if you code to minor version X, your code will work with minor version X+1, X+2... as long as the major version is the same.
- A patch version.  This increments for either non-API feature additions or bug fixes.  Note that non-API feature additions can be significant, such as the addition of Modbus TCP support!

An example of a version is **2.1.9**.   This is:

- Major version 2 of the overall API.  This is a breaking change compared to version 1.
- Minor version 1 of the overall API.  There are several feature additions compared to 2.0.x such as the callback, bit handling and log handling API functions.
- Patch version 9.  This is the ninth incremental patch version and contains both bug fixes and non-API feature additions over previous releases.

If you need at least a specific version of the library, the `plc_tag_check_lib_version()` function can help.   It takes three integer parameters: a major version number, a minor version number, and a patch version number.   These are used in SemVer-like fashion.  The function will return `PLCTAG_STATUS_OK` if the following are true and `PLCTAG_ERR_UNSUPPORTED` if the following are not all true:

- The version major value you request is exactly the same as the library's version major value.
- The version minor value you request is less than or equal to the library's version minor value.
- The patch version is:
  - less than or equal to the library's version _if_ the minor version you request is the same as the library's version.
  - is ignored if the minor version you request is less than the library's minor version.

```c
int plc_tag_check_lib_version(int req_major, int req_minor, int req_patch);
```

It is strongly recommended that you start off your programs or wrappers with a call to `plc_tag_check_lib_version()` if you use dynamic linking to get the C library!

## Tag Life Cycle

### Creating a Tag Handle

In order to create a tag handle, you must know what protocol you are going to use and any arguments that that protocol requires.  The entire set of information for accessing a tag is contained in a string that is passed to one of the `plc_tag_create()` or `plc_tag_create_ex()` functions.  This string is formatted in a manner similar to a URL.  It is composed of key-value pairs delimited by ampersands.   **Note that calling one of these functions does not create a tag in the PLC**.  They create or open a handle to a tag or field within a tag that already exists in the PLC.

Use the second function if you need to create a tag handle and immediately set a callback to catch events on it.  The first function is equivalent to calling the second function with _NULL_ for the callback and user data pointers.

```c
int32_t plc_tag_create(const char *attrib_str, int timeout);
int32_t plc_tag_create_ex(const char *attrib_str, void (*tag_callback_func)(int32_t tag_id, int event, int status, void *userdata), void *userdata, int timeout);
```

**Arguments** 

`attrib_str`: A C-style string (nul character terminated) that contains all the attributes needed to create the tag.  

`tag_callback_func`: a C function pointer to a callback function that will be used when various events within the tag's lifecycle are generated.   If you need events early in the tag's lifetime, use the extended create function.

`userdata`: A C void pointer value.   This will be passed to every invocation of the callback.   It is your responsibility to make sure that the pointer is always pointing to valid memory.   The library does not do anything with the pointer other than pass it back to you.  For systems such as Java that have garbage collected memory, you must only pass values that either are pinned so that the garbage collector does not move them or pass values that are not pointers.

`timeout`: a value in milliseconds to wait for the tag handle creation to complete.   Most types of tags will automatically do a read before the create process is considered complete. If you use zero for the timeout value, the function may return before the underlying PLC connection is set up.  In that case you should use `plc_tag_status()` to determine when the tag handle is ready for use. Generally connections are shared, so a second tag created against a given PLC may return almost immediately if the another tag is already connected to the same PLC.

**Returns** an integer handle to a tag in most cases.  If there was an error that prevented any creation of the tag at all (i.e. no memory), a negative value will be returned.  The value will be one of the above errors.

The _attrib_str_ argument depends on the protocol type.  The caller is responsible for managing the memory of the attribute string.  For tag string options see the [Tag String Attributes](https://github.com/libplctag/libplctag/wiki/Tag-String-Attributes) wiki page.

#### Example

```c
int32_t tag = plc_tag_create("protocol=ab_eip&gateway=192.168.1.42&path=1,0&cpu=LGX&elem_count=10&name=myDINTArray[0]", 1000);
```

### Destroying a Tag

Tags handles use internal resources and must be freed.  **DO NOT** use `free()`.  Tags are more than a single block of memory internally (though we'd like that level of simplicity).  To free a tag, the `plc_tag_destroy()` function must be called:

```c
int plc_tag_destroy(int32_t tag);
```

**Your program is responsible for creating and destroying tags when you are done with them!**  The library will manage all internal resources, but your program is responsible for determining when to destroy a tag handle.  The library allocates tag handles in such as way as to minimize the chance that a given tag handle will be reused.

**Returns** an error code from above.

### Shutting Down the Library

Some wrappers and systems are not able to trigger the standard POSIX or Windows functions when the library is being unloaded or the program is shutting down.   In those cases, you can call:

```c
void plc_tag_shutdown(void);
```

After this function returns, the library will have cleaned up all internal threads and resources.   You can immediately turn around and call `plc_tag_create()` again and the library will start up again.

**Note:** you must call `plc_tag_destroy()` on all open tag handles before calling `plc_tag_shutdown()`.

***

## Callbacks

### Event Callback

The event callback API comprises three functions:

```c
int plc_tag_register_callback(int32_t tag_id, void (*tag_callback_func)(int32_t tag_id, int event, int status));
int plc_tag_register_callback_ex(int32_t tag_id, void (*tag_callback_func)(int32_t tag_id, int event, int status, void *userdata), void *userdata);
int plc_tag_unregister_callback(int32_t tag_id);
```

Each tag may have zero or one callback functions registered.   Attempting to register a callback on a tag with a callback will return the error `PLCTAG_ERR_DUPLICATE`.  A successful registration will return `PLCTAG_STATUS_OK`.
Attempting to unregister a callback from a tag without one will return `PLCTAG_ERR_NOT_FOUND`.  If there is a callback registered on the tag, it will be removed and `PLCTAG_STATUS_OK` returned.

You may only register one callback regardless of which register function you call.

The library provides a function to register a callback on a tag.   The following events generate a call to the callback function:

| Event Code                        | Value | Description                                                                                                                             |
|-----------------------------------|-------|-----------------------------------------------------------------------------------------------------------------------------------------|
| `PLCTAG_EVENT_CREATED`            | 7     | The callback is called after a tag creation completes. The final status of the creation is passed to the callback as well. This is not as well supported in some cases, so only depend on this for normal tags and not tags like _@tags_. |
| `PLCTAG_EVENT_READ_STARTED`       | 1     | A read of the tag has been requested. The callback is called immediately before the underlying protocol implementation is called.        |
| `PLCTAG_EVENT_READ_COMPLETED`     | 2     | The callback is called after a read completes. The final status of the read is passed to the callback as well.                          |
| `PLCTAG_EVENT_WRITE_STARTED`      | 3     | As with reads, the callback is called when a write is requested. The callback can change the data in the tag and the changes will be sent to the PLC. |
| `PLCTAG_EVENT_WRITE_COMPLETED`    | 4     | The callback is called when the PLC indicates that the write has completed. The status of the write is passed to the callback.           |
| `PLCTAG_EVENT_ABORTED`            | 5     | The callback function is called when something calls `plc_tag_abort()` on the tag.                                                      |
| `PLCTAG_EVENT_DESTROYED`          | 6     | The callback function is called when the tag is being destroyed. It is not safe to call any API functions on the tag at this time. This is purely for the callback to manage any application state. |


The second callback type allows your application to pass a pointer-sized value and get it back when the callback is called.   **WARNING** If you use a language where objects can move in memory such as Java or .Net, you must make sure that the objects are pinned and cannot move! If you do not, you may crash the application.  The library has no idea that the garbage collector in those types of languages exists and has no way of correcting pointers.

Event callbacks have some restrictions:

1. Do not do anything that could block!  The callback is called from within very performance-sensitive code.
2. The callback function _may_ be called by an internal thread in the library.  Your code is responsible for ensuring safe access to the internals of your application.   Some events will result in the callback being called in the same thread that called the underlying API function.  For instance, when your code calls plc_tag_abort(), the callback will be called in the same thread context.   If you are using asychronous calls to read and write tags, the callback will be called by one of the library's internal threads.   Do not assume either case!
3. Callbacks are called for all seven of the entry points listed above.   The event parameter passed to the callback function tells your application which event is happening.
4. Since callbacks can be called somewhat asynchronously, some reordering of events may happen.  This is going to be fixed in later versions of library.

### Log Callback

You can redirect all logging to your own provided callback function.   The two API calls are:

```c
int plc_tag_register_logger(void (*log_callback_func)(int32_t tag_id, int debug_level, const char *message));
int plc_tag_unregister_logger(void);
```

You can only register one logger callback.   The entire library will use that callback to output logs instead of the default code which outputs to `stderr`.

The registration function `plc_tag_register_logger()` will return `PLCTAG_STATUS_OK` on successful registration of the callback.   If there is already a callback registered, it will return `PLCTAG_ERR_DUPLICATE`.   The function to remove the logging callback, `plc_tag_unregister_logger()` will return `PLCTAG_STATUS_OK` on success and `PLCTAG_ERR_NOT_FOUND` if there was no logging function registered.

Log messages are sent to the callback as they would be printed on stderr normally.   The arguments are as follows:

- `tag_id` The tag handle of the tag to which the message applies, if that is applicable.  Some messages are sent from background tasks or for things that are not specific to a single tag.
- `debug_level` The debug level of the originating debug printout statement.  This will let you know if the message is a warning, informational or merely detailed debugging.  This level will be filtered by the global debug level setting.
- `message` The text string of the log message.   This string is *NOT* owned by the application.  It is owned by the library.   If you need to store it or change it, you must make a copy and modify or store that.   Do not free the string.  The library will manage it.

**WARNING** There are some important restrictions on logging callback functions:

- The logging callback will be called from multiple threads, sometimes simultaneously!  Your code must be thread aware and thread-safe.
- The logging callback will be called with one or more mutexes held in almost all cases.   **You must not call any tag API functions other than** `plc_tag_decode_error()`.   If you do there is a large chance that the library will hang.
- Logging messages come from deep within the library's core routines.  Many of these are very delay sensitive.   Do not do anything that would block or delay the return of the logging callback to the library!
- The message string passed to your callback function will be managed by the library.  Do not attempt to free its memory or modify the string.   If you need to do modifications, make your own copy and return.

***

## Controlling Multi-threaded Access to a Tag

The library is designed for multi-threaded use.  But only within single API calls.   So, you need to wrap access to API functions with a mutex or something similar if you want to guard access to sequences of API calls.  The C API provides `plc_tag_lock()` and `plc_tag_unlock()` for use with C/C++.  However, if you are using a wrapper like Java, you should use the native synchronization facilities of that language!

In the example code, there is a small program, [multithread.c](https://github.com/libplctag/libplctag/blob/master/src/examples/multithread.c), that illustrates the use of the built-in locking.

```c
int plc_tag_lock(int32_t tag);
int plc_tag_unlock(int32_t tag);
```

**Returns** an error code.

Use it like this (example taken from multithread.c):

```c
    do {
        rc = plc_tag_lock(tag);
        if(rc != PLCTAG_STATUS_OK) {
            value = 1000;
            break; /* punt, no lock */
        }

        rc = plc_tag_read(tag, DATA_TIMEOUT);
        if(rc != PLCTAG_STATUS_OK) {
            value = 1001;
        } else {
            value =  plc_tag_get_float32(tag,0);

            /* increment the value */
            value = (value > 500.0 ? 0.0 : value + 1.5);

            /* yes, we should be checking this return value too... */
            plc_tag_set_float32(tag, 0, value);

            /* write the value */
            rc = plc_tag_write(tag, DATA_TIMEOUT);
        }

        /* yes, we should look at the return value */
        plc_tag_unlock(tag);
    } while(0);
```

***

## Aborting an Operation

In some cases, the application using the library may decide to termination a pending operation on the tag.  For instance, if the tag operation was done without a timeout value, the application will do the timeout itself and will call the `plc_tag_abort()` function to stop any operation in progress.  This may free up resources internally.

Though this operation immediately returns, it may take some amount of time for the operation to clear any internal queues if it was in flight at the time of the call.  This is generally a very short period of time (milliseconds) and will not usually impact subsequent API calls.

```c
int plc_tag_abort(int32_t tag);
```

**Returns** an error code from above.

***

## Reading a Tag

Reading a tag brings the data at the time of read into the local memory of the PC running the library.  The data is not automatically kept up to date.  If you need to find out the data periodically, you need to read the tag periodically.

```c
int plc_tag_read(int32_t tag, int timeout);
```

#### Args

- **tag** - the handle to the tag created by calling `plc_tag_create()`.
- **timeout** - A timeout value in milliseconds.  If the value is zero, the function will set up the read request and immediately return.  If the timeout value is greater than zero, then the function will wait up to that number of milliseconds for the read operation to complete.  If the read does not complete in the timeout period, the operation will be aborted and the function will return `PLCTAG_ERR_TIMEOUT`.

**Returns** the status code (one of the ones above).  `PLCTAG_STATUS_OK` will be returned if the read operation completed successfully.  If the timeout was zero, the function will usually return `PLCTAG_STATUS_PENDING`.  If there was a failure or error, the negative appropriate status code will be returned.


***

## Retrieving Tag Status

The status of a tag can be retrieved with the `plc_tag_status()` function.  If there is an operation pending, this will return `PLCTAG_STATUS_PENDING`.  All API operations set the tag status.

```c
int plc_tag_status(int32_t tag);
```

**Returns** the status code representing the current tag status.

***

## Writing a Tag

A tag can be written to the target PLC with the `plc_tag_write()` function.  The `plc_tag_set_X()` functions should be called first in order to set the data.

**Note:** If you are accessing a tag in a Logix-class PLC, the type encoding rules for AB are quite
arcane.  In order to work around this, if you write before reading, a read will be transparently done
first to get the type encoding data for the tag.

As for `plc_tag_read()`, a timeout value is passed.  If it is zero, then the write operation queues the operation for later completion and returns immediately.

```c
int plc_tag_write(int32_t tag, int timeout);
```

**Returns** the status of the operation.  Return values as for _plc_tag_read_.

***

## Retrieving/Setting Tag Size

The `plc_tag_size()` function retrieves the size of the tag in bytes.  If there is an error (they are negative) that will be returned instead.

```c
int plc_tag_get_size(int32_t tag);
```

**Returns** The size of the tag data in bytes or the error code (negative values).

***

The `plc_tag_set_size()` function sets the underlying buffer size (in bytes) of the tag. This is considered an advanced API function call and generally should not be used unless you are working with raw CIP tags.

```c
int plc_tag_set_size(int32_t tag, int new_size);
```

**Arguments** The function takes a tag ID/handle and an integer for the new size.  If the new size is larger than the old size, the added elements may contain garbage data.   If the new size is smaller than the old size, then the higher offsets will be cut off and that data will be permanently lost.

**Returns** the previous size, in bytes, of the tag's internal data buffer or a negative value for any error.

## Getting Tag Data Elements

The following functions support getting and setting integer and floating point values from or in a tag.

The getter functions return the value of the size in the function name from the tag at the **byte** offset in the tag's data.

The setter functions do the opposite and put the passed value (using the appropriate number of bytes) at the passed byte offset in the tag's data.

Unsigned getters return the appropriate `UINT_MAX` value for the type size on error.  I.e. `plc_tag_get_uint16()`
returns 65535 (`UINT16_MAX`) if there is an error.  You can check for this value and then call _plc_tag_status_ to determine what went wrong.  Signed getters return the appropriate `INT_MIN` value on error.

Setters return one of the status codes above.  If there is no error then `PLCTAG_STATUS_OK` will be returned.

**NOTE** the implementation of the floating point getter and setter may not be totally portable.  Please test before use on big-endian machines.

All getters and setters convert their data into the correct endian type.  A setter will convert the host endian data into the target endian data.  A getter will convert the target endian data it retrieves into the host endian format.

### Tag Data Accessors


#### 64-bit Integer Accessors.

```c
uint64_t plc_tag_get_uint64(int32_t tag, int offset);
int plc_tag_set_uint64(int32_t tag, int offset, uint64_t val);

int64_t plc_tag_get_int64(int32_t tag, int offset);
int plc_tag_set_int64(int32_t, int offset, int64_t val);
```

#### 32-bit Integer Accessors

```c
uint32_t plc_tag_get_uint32(int32_t tag, int offset);
int plc_tag_set_uint32(int32_t tag, int offset, uint32_t val);

int32_t plc_tag_get_int32(int32_t tag, int offset);
int plc_tag_set_int32(int32_t, int offset, int32_t val);
```

#### 16-bit Integer Accessors

```c
uint16_t plc_tag_get_uint16(int32_t tag, int offset);
int plc_tag_set_uint16(int32_t tag, int offset, uint16_t val);

int16_t plc_tag_get_int16(int32_t tag, int offset);
int plc_tag_set_int16(int32_t, int offset, int16_t val);
```

#### 8-bit Integer Accessors

```c
uint8_t plc_tag_get_uint8(int32_t tag, int offset);
int plc_tag_set_uint8(int32_t tag, int offset, uint8_t val);

int8_t plc_tag_get_int8(int32_t tag, int offset);
int plc_tag_set_int8(int32_t, int offset, int8_t val);
```

#### Bit Accessors

```c
int plc_tag_get_bit(int32_t tag, int offset_bit);
int plc_tag_set_bit(int32_t tag, int offset_bit, int val);
```

#### 64-bit Floating Point Accessors

```c
double plc_tag_get_float64(int32_t tag, int offset);
int plc_tag_set_float64(int32_t tag, int offset, double val);
```

#### 32-bit Floating Point Accessors

```c
float plc_tag_get_float32(int32_t tag, int offset);
int plc_tag_set_float32(int32_t tag, int offset, float val);
```

### Handling Single Bits

There are two main ways to handle individual bits in the library for tags that are not BOOL types.

1. Do it yourself.   Pull down the word containing the bits you want to read and mask them off yourself.  This is fast and you can check multiple bits at the same time in one read operation.   However, writing is dangerous!  If there is anything other than your program writing to that word, you can overwrite other changes.  Note that the `plc_tag_get_bit()` and `plc_tag_set_bit()` functions work on any integer tag.
2. (on ControlLogix, CompactLogix and Micro8xx) you can suffix your tag name with a period and a number indicating the bit.  E.g. `protocol=ab-eip&gateway=....&name=MyIntTag.23`.   This example will get the 24th bit (counting starts at zero!).   You will only be able to read an write that single bit with the tag.
You can use most of the accessor functions and will get either 1 or 0 depending on the bit's state.   Writes are safe (at least as far as the CIP protocol allows) by internally sending a mask for OR-ing to set a bit and AND-ing to clear a bit.

### Handling Strings

The following API functions ease the use of strings.

```c
int plc_tag_get_string(int32_t tag_id, int string_start_offset, char *buffer, int buffer_length);
int plc_tag_set_string(int32_t tag_id, int string_start_offset, const char *string_val);
int plc_tag_get_string_length(int32_t tag_id, int string_start_offset);
int plc_tag_get_string_capacity(int32_t tag_id, int string_start_offset);
int plc_tag_get_string_total_length(int32_t tag_id, int string_start_offset);
```

#### Reading A String

```c
plc_tag_get_string(int32_t tag_id, int string_start_offset, char *buffer, int buffer_length);
```

This function retrieves a string from the internal tag buffer.  The client application or wrapper is responsible for managing the passed buffer memory.  **NOTE** do not use memory that can be moved independently of the application.  I.e. never use a managed block of memory because GC may move it while the C library is writing to it.  Bad things will happen.

**Args**

- **tag_id** - the handle to the tag created by calling `plc_tag_create()`.
- **string_start_offset** - the byte offset of the beginning of the string in the tag buffer.
- **buffer** - a character buffer in which to copy the tag data.  **NOTE** this needs to be sized such that a zero termination character can be added!  The string is copied as a C-style string regardless of how it is stored in the PLC.
- **buffer_length** - the length, in characters, of the buffer.  **NOTE** if **_buffer_length_** is smaller than the size of the string, only the string characters that fit will be copied.

**Return Values**

- **PLCTAG_ERR_NOT_FOUND** - returned if the tag ID/handle does not map to a valid tag.
- **PLCTAG_ERR_UNSUPPORTED** - returned if the tag type/PLC type does not have any string definition or is a type that cannot be accessed as a string such as a bit tag.
- **PLCTAG_ERR_NO_DATA** - Returned if the tag data buffer is empty or missing.
- **PLCTAG_ERR_OUT_OF_BOUNDS** - Returned if the tag data will be off the end of the internal tag buffer.

#### Writing A String

```c
int plc_tag_set_string(int32_t tag_id, int string_start_offset, const char *string_val);
```

This function sets the string in the tag buffer to the value passed as a C-style string (zero-terminated).  **NOTE** The tag buffer will require sufficient space to store the new string value.   If the string is not zero-terminated in the PLC, then the termination character will not count toward that space.

**Args**

- **tag_id** - the handle to the tag created by calling `plc_tag_create()`.
- **string_start_offset** - the byte offset of the beginning of the string in the tag buffer.
- **string_val** - A C-style string to copy into the tag data buffer.   Must be zero terminated.

**Return Values**

- **PLCTAG_ERR_NOT_FOUND** - returned if the tag ID/handle does not map to a valid tag.
- **PLCTAG_ERR_UNSUPPORTED** - returned if the tag type/PLC type does not have any string definition or is a type that cannot be accessed as a string such as a bit tag.
- **PLCTAG_ERR_NO_DATA** - Returned if the tag data buffer is empty or missing.
- **PLCTAG_ERR_NULL_PTR** - Returned if the passed C-string is NULL.
- **PLCTAG_ERR_OUT_OF_BOUNDS** - Returned if writing the whole string would go out of bounds of the tag data buffer.
- **PLCTAG_ERR_TOO_LARGE** - Returned if the string will not fit within the capacity of the string in the tag data buffer.

**WARNING** As with reading tags, the string passed to the function must not be moved in memory during the call.

#### Getting A String Length

```c
int plc_tag_get_string_length(int32_t tag_id, int string_start_offset);
```

This function returns the number of bytes in the string.  This is PLC/tag-specific.  **NOTE** if the PLC string is zero-terminated, the length reported will not count the termination byte!

**Args**

- **tag_id** - the handle to the tag created by calling `plc_tag_create()`.
- **string_start_offset** - the byte offset of the beginning of the string in the tag buffer.

**Return Values**

The return value is negative if there is an error and the length of the string if there is no error.

- **PLCTAG_ERR_NOT_FOUND** - returned if the tag ID/handle does not map to a valid tag.
- **PLCTAG_ERR_UNSUPPORTED** - returned if the tag type/PLC type does not have any string definition or is a type that cannot be accessed as a string such as a bit tag.
- **PLCTAG_ERR_NO_DATA** - Returned if the tag data buffer is empty or missing.

#### Getting A String Capacity

```c
int plc_tag_get_string_capacity(int32_t tag_id, int string_start_offset);
```

This function returns a value of how large the string can be.   This is PLC/tag specific.   Note that some string types cannot be extended at this time.

**Args**

- **tag_id** - the handle to the tag created by calling `plc_tag_create()`.
- **string_start_offset** - the byte offset of the beginning of the string in the tag buffer.

**Return Values**

The return value is negative if there is an error and the capacity of the string if there is no error.

- **PLCTAG_ERR_NOT_FOUND** - returned if the tag ID/handle does not map to a valid tag.
- **PLCTAG_ERR_UNSUPPORTED** - returned if the tag type/PLC type does not have any string definition or is a type that cannot be accessed as a string such as a bit tag.
- **PLCTAG_ERR_NO_DATA** - Returned if the tag data buffer is empty or missing.

#### Getting the Space Occupied by a String

Strings can occupy more space than just their character contents would suggest.   For instance, AB strings have a leading count word and some have trailing padding.   This function returns the total number of bytes taken up by the string at the starting offset.  Use this function to skip past a string.

```c
int plc_tag_get_string_total_length(int32_t tag_id, int string_start_offset);
```
**Args**

- **tag_id** - the handle to the tag created by calling `plc_tag_create()`.
- **string_start_offset** - the byte offset of the beginning of the string in the tag buffer.

**Return Values**

The return value is negative if there is an error and the capacity of the string if there is no error.

- **PLCTAG_ERR_NOT_FOUND** - returned if the tag ID/handle does not map to a valid tag.
- **PLCTAG_ERR_UNSUPPORTED** - returned if the tag type/PLC type does not have any string definition or is a type that cannot be accessed as a string such as a bit tag.
- **PLCTAG_ERR_NO_DATA** - Returned if the tag data buffer is empty or missing.










### Handling Raw Bytes

The following API functions support getting and setting unprocessed bytes directly from the tag data buffer.   These
functions support bypassing the other data accessor functions either for direct client program use or for speed.

```c
int plc_tag_get_raw_bytes(int32_t tag_id, int start_offset, uint8_t *buffer, int buffer_length);
int plc_tag_set_raw_bytes(int32_t tag_id, int start_offset, uint8_t *buffer, int buffer_length);
```

#### Reading Raw Bytes

```c
int plc_tag_get_raw_bytes(int32_t tag_id, int start_offset, uint8_t *buffer, int buffer_length);
```

This function retrieves a segment of raw, unprocessed bytes from the internal tag buffer.  The client application or wrapper is responsible for managing the passed buffer memory.  **NOTE** do not use memory that can be moved independently of the application.  I.e. never use a managed block of memory because GC may move it while the C library is writing to it.

The data in the tag buffer is copied, unchanged, into the passed buffer.

**Args**

- **tag_id** - the handle to the tag created by calling `plc_tag_create()`.
- **start_offset** - the byte offset of the beginning of the data to copy in the tag buffer.
- **buffer** - a byte buffer in which to copy the tag data.  It must be at least as long as **buffer_length** bytes.
- **buffer_length** - the length, in bytes, of the buffer.  If buffer length would exceed the end of the data in the tag data buffer, an out of bounds error is returned.

**Return Values**

- **PLCTAG_ERR_NOT_FOUND** - returned if the tag ID/handle does not map to a valid tag.
- **PLCTAG_ERR_UNSUPPORTED** - returned if the tag type/PLC type that cannot be accessed as raw bytes such as a bit tag.
- **PLCTAG_ERR_NO_DATA** - Returned if the tag data buffer is empty or missing.
- **PLCTAG_ERR_NULL_PTR** - Returned if the passed buffer is NULL.
- **PLCTAG_ERR_OUT_OF_BOUNDS** - Returned if the tag data will be off the end of the internal tag buffer.

#### Writing Raw Bytes

```c
int plc_tag_set_raw_bytes(int32_t tag_id, int start_offset, uint8_t *buffer, int buffer_length);
```

This function takes a segment of raw, unprocessed bytes from the client program and copies it into the internal tag buffer starting at the specified location.  The client application or wrapper is responsible for managing the passed buffer memory.  **NOTE** do not use memory that can be moved independently of the application.  I.e. never use a managed block of memory because GC may move it while the C library is writing to it.

**Args**

- **tag_id** - the handle to the tag created by calling `plc_tag_create()`.
- **start_offset** - the byte offset of the location in the tag data buffer to start copying the data in the passed buffer.
- **buffer** - a byte buffer from which to copy the data.  It must be at least as long as **buffer_length** bytes.
- **buffer_length** - the length, in bytes, of the buffer.  If buffer length would exceed the end of the data in the tag data buffer, an out of bounds error is returned.

**Return Values**

- **PLCTAG_ERR_NOT_FOUND** - returned if the tag ID/handle does not map to a valid tag.
- **PLCTAG_ERR_UNSUPPORTED** - returned if the tag type/PLC type that cannot be accessed as raw bytes such as a bit tag.
- **PLCTAG_ERR_NO_DATA** - Returned if the tag data buffer is empty or missing.
- **PLCTAG_ERR_NULL_PTR** - Returned if the passed buffer is NULL.
- **PLCTAG_ERR_OUT_OF_BOUNDS** - Returned if the tag data will be off the end of the internal tag buffer.

### Tag Internal Attribute Functions

Some tag internal attributes are exposed via the following functions:

```c
int plc_tag_get_int_attribute(int32_t tag, const char *attrib_name, int default_value);
int plc_tag_set_int_attribute(int32_t tag, const char *attrib_name, int new_value);
```

When getting an attribute you must provide the tag ID (or zero for library-level attributes), the attribute name, and a default value to return in case the attribute was not found.

When setting an attribute, the function `plc_tag_set_int_attribute()` will return `PLCTAG_STATUS_OK` if all went well.  It will return `PLCTAG_ERR_NOT_FOUND` if that attribute is not supported for the tag.   Generally `PLCTAG_ERR_OUT_OF_BOUNDS` will be returned if you attempt to set an attribute to an illegal value.

The following attributes are currently supported.

|   Attribute   | R/W | Tag/Library | Meaning |
|   --:         | :-: |    :-:      |  :-     |
| debug   |R/W| Library | **Preferred** Get or set the tag debug level.   This duplicates the existing `plc_tag_set_debug_level()` function. |
| debug_level   |R/W| Library | **Deprecated** Get or set the tag debug level.   This duplicates the existing `plc_tag_set_debug_level()` function. |
| version_major | R | Library | Get the major version of the library version.  E.g. if the library is version 2.1.5, the attribute will return 2. |
| version_minor | R | Library | Get the minor version of the library.   If the library is version 2.1.5, this will return 1. |
| version_patch | R | Library | Get the patch version of the library.   If the library is version 2.1.5, this will return 5. |
| size | R | Tag | Get the size in bytes used by the tag.  Duplicates the functionality of `plc_tag_get_size()` |
| read_cache_ms | R/W | Tag | Get or set the amount of time to cache read results, in milliseconds. |
| elem_size | R | Tag | Returns the size in bytes of a single element of the tag (treating the tag as an array, perhaps of size 1). |
| elem_count | R | Tag | Returns the size of the tag in number of elements if the tag is an array, one (1) otherwise. |

## Debugging

The library provides debugging output when enabled.   There are three ways to set the debug level (for historical reasons):

1. Added a debug attribute to the attribute string when creating a tag: "protocol=XXX&...&debug=4".
2. Using the `plc_tag_set_int_attribute()` function to set the `debug` attribute.
3. Using the `plc_tag_set_debug_level()` function.

The preferred method in code is the last one.

There are several levels of debugging possible:

| Debug Level              | Value | Description                                                                                                                      |
|--------------------------|-------|----------------------------------------------------------------------------------------------------------------------------------|
| `PLCTAG_DEBUG_NONE`      | 0     | Disables debugging output                                                                                                        |
| `PLCTAG_DEBUG_ERROR`     | 1     | Only output errors. Generally, these are fatal to the functioning of the library.                                                |
| `PLCTAG_DEBUG_WARN`      | 2     | Outputs warnings such as errors found when checking a malformed tag attribute string or when unexpected problems are reported from the PLC. |
| `PLCTAG_DEBUG_INFO`      | 3     | Outputs diagnostic information about the internal calls within the library. Includes some packet dumps.                          |
| `PLCTAG_DEBUG_DETAIL`    | 4     | Outputs detailed diagnostic information about the code executing within the library including packet dumps.                      |
| `PLCTAG_DEBUG_SPEW`      | 5     | Outputs extremely detailed information. Do not use this unless you are trying to debug detailed information about every mutex lock and release. Will output many lines of output per millisecond. You have been warned! |

