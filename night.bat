@echo off
if "%PROCESSOR_ARCHITECTURE%"=="AMD64" (
 start electron\win32-x64\electron.exe . %1 %2 %3 %4 %5 %6 %7 %8 %9
) else (
 start electron\win32-ia32\electron.exe . %1 %2 %3 %4 %5 %6 %7 %8 %9
)
