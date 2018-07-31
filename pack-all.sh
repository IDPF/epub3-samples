#!/bin/bash

for dir in $(find 30 -mindepth 1 -maxdepth 1 -type d)
do   
  echo "<<<<<< $dir >>>>>>"
  sh pack-single.sh $dir
  echo
done
