---
sidebar_position: 9
# id: my-doc-id
# slug: /alternate-build-mingw-gnu
title: Running plctag.dll on Windows
# description: My document description
---

(This information comes from user `@Carlos`, thanks!)

I had an issue where the RunTime libraries for the DLL are not up to date on a target machine. This information should be also provided on the wrappers.

## Redistributing Visual C++ Files

[Redistributing Visual C++ Files](https://docs.microsoft.com/en-us/cpp/windows/redistributing-visual-cpp-files?view=vs-2019)

The Visual C++ Redistributable Packages install and register all Visual C++ libraries. If you use one, you must set it to run on the target system as a prerequisite to the installation of your application. We recommend that you use these packages for your deployments because they enable automatic updating of the Visual C++ libraries. For an example about how to use these packages, see Walkthrough: Deploying a Visual C++ Application By Using the Visual C++ Redistributable Package.

To deploy redistributable Visual C++ files, you can use the Visual C++ Redistributable Packages (VCRedist_x86.exe, VCRedist_x64.exe, or VCRedist_arm.exe) that are included in Visual Studio.

## Determining Which DLLs to Redistribute

[Determining Which DLLs to Redistribute](https://docs.microsoft.com/en-us/cpp/windows/determining-which-dlls-to-redistribute?view=vs-2019)

To determine which DLLs you have to redistribute with your application, collect a list of the DLLs that your application depends on. These are normally listed as import library inputs to the linker. Certain libraries, such as vcruntime and the Universal C Runtime Library (UCRT), are included by default. If your app or one of its dependencies uses LoadLibrary to dynamically load a DLL, that DLL may not be listed in the inputs to the linker. One way to collect the list of dynamically loaded DLLs is to run Dependency Walker (depends.exe) on your app, as described in Understanding the Dependencies of a Visual C++ Application. Unfortunately, this tool is outdated and may report that it can’t find certain DLLs.

## Understanding the Dependencies of a Visual C++ Application

[Understanding the Dependencies of a Visual C++ Application](https://docs.microsoft.com/en-us/cpp/windows/understanding-the-dependencies-of-a-visual-cpp-application?view=vs-2019)

To determine which Visual C++ libraries an application depends on, you can view the project properties. (In Solution Explorer, right-click on the project and choose Properties to open the Property Pages dialog box.) On Windows 8 and earlier, you can also use the Dependency Walker (depends.exe), which gives a more comprehensive picture of the dependencies. For more recent versions of Windows the lucasg/Dependencies tool provides similar functionality (this is a third-party tool not guaranteed by Microsoft.)

[lucasg/Dependencies](https://github.com/lucasg/Dependencies)