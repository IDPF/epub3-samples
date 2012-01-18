#!/bin/bash

for dir in `ls "30"`
do   
  echo -e "\n<<<<<< $dir >>>>>>"  
  if [ -d "30/$dir" ]; then
    sh pack-single.sh 30/$dir
  fi
done