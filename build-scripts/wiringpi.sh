#!/bin/bash
PWD="`dirname "$(readlink -f "$0")"`"
cd "$PWD/../WiringPi"

git submodule update --init

./build
