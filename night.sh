#!/bin/bash

if [ "$(uname)" == "Darwin" ]; then
    # Do something under Mac OS X platform
    platform=darwin
elif [ "$(expr substr $(uname -s) 1 5)" == "Linux" ]; then
    # Do something under Linux platform
    platform=linux
elif [ "$(expr substr $(uname -s) 1 10)" == "MINGW32_NT" ]; then
    # Do something under Windows NT platform
    platform=win32
else
    echo Unkown platform. Only Linux, MacOS - Darwin and Windows are supported.
fi

if [ `arch` == "x86_64" ]; then
    arch=x64
elif [ `arch` == "i686" ]; then
    arch=ia32
elif [ `arch` == "armv71" ]; then
    arch=arm
else
    echo Unknown architecture. Only 32 or 64 bits platforms are supported.
    exit
fi

exec electron/$platform-$arch/electron . $1 $2 $3 $4 $5 $6 $7 $8 $9
