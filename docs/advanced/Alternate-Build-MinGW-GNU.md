---
sidebar_position: 2
# id: my-doc-id
# slug: /alternate-build-mingw-gnu
title: "Alternate Build: MinGW GNU"
# description: My document description
---

# Alternate Build: MinGW GNU

(This comes from user `alpep`, thanks!)

I would like to share with you how I build the Libplctag for OS: Win10 32bit by using Mingw. To be able to compile the code, I had to modify two files: platform.h and debug.h.

Step by step procedure:

1. Download and install CMake: https://cmake.org/download/cmake-3.16.0-rc2-win32-x86.msi
   
   Add CMake (C:\Program Files\CMake\bin) to the system PATH, can be done while installing it.

1. Download and install MinGW64: https://sourceforge.net/projects/mingw-w64/files/Toolchains%20targetting%20Win32/Personal%20Builds/mingw-builds/installer/mingw-w64-install.exe/download/mingw-w64-install.exe

   Install using the default settings

1. Download and unzip the library "libplctag-master", for example C:\libplctag-master;

    In folder C:\libplctag-master, create a new folder "Build";

    Edit file C:\libplctag-master\CMakeLists.txt, insert:

    ```makefile
    SET(CMAKE_C_COMPILER gcc.exe)
    SET(CMAKE_C_FLAGS "-m32 -mno-ms-bitfields -D_WIN32_WINNT=0x0600 -DLIBPLCTAGDLL_EXPORTS=1")
    SET(CMAKE_CXX_COMPILER g++.exe)
    SET(CMAKE_CXX_FLAGS "-m32 -mno-ms-bitfields -D_WIN32_WINNT=0x0600 -DLIBPLCTAGDLL_EXPORTS=1")
    ```

    Before lines:

    ```
    # this is the root libplctag project
    project (libplctag_project)
    ```

    Save and close file.

1. Code modifications:

    Edit file: C:\libplctag-master\src\platform\windows\platform.h

    Replace:
    ```
    #define START_PACK __pragma( pack(push, 1) )
    #define END_PACK   __pragma( pack(pop) )
    ```

    By:
    ```
    #ifdef _MSC_VER
        #define START_PACK __pragma( pack(push, 1) )
        #define END_PACK   __pragma( pack(pop) )
    #else
        #define START_PACK          
        #define END_PACK  __attribute__((packed))   
    #endif
    ```

    And replace:
    ```
    #define __PRETTY_FUNCTION__  __FUNCTION__
    ```

    By:
    ```
    #ifdef _MSC_VER
        #define __PRETTY_FUNCTION__  __FUNCTION__
    #else
        #define __PRETTY_FUNCTION__  __func__
    #endif
    ```

    Save and close file.

    Edit file: C:\libplctag-master\src\platform\util\debug.h

    Replace:
    ```
    #ifdef _WIN32
        #define __func__ __FUNCTION__
    #endif
    ```

    By:

    ```
    #if defined(_WIN32) && defined(_MSC_VER)
        #define __func__ __FUNCTION__
    #endif
    ```

    Save and close file.

1. To build the library:

    In Windows Start menu, click on MinGW-W64\Run Terminal;

    This will add the MinGW directory to the system PATH and open the Windows command terminal.

    Enter command lines:

    ```
    > C: <Enter>
    > cd libplctag-master\Build <Enter>
    > cmake -G "MinGW Makefiles" .. <Enter>
    > mingw32-make <Enter>
    ```

    Binaries are in folder: `C:\libplctag-master\Build\bin_dist`

    Executable needs following files `libgcc_s_dw2-1.dll` and `libwinpthread-1.dll` which are found in `C:\Program Files\mingw-w64\i686-8.1.0-posix-dwarf-rt_v6-rev0\mingw32\bin`.

Hope this could help someone else.