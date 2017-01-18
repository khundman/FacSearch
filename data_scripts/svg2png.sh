#!/bin/bash

cd $1
for d in *; do
	len=${#d}
	pos=4
	index="$(( $len - $pos ))"
	outfile=${d:0:($index)}  
	/Applications/Inkscape.app/Contents/Resources/bin/inkscape --without-gui --file=$1$d --export-pdf=$2$outfile.pdf
done
cd $2
for e in *; do
	len=${#e}
	pos=4
	index="$(( $len - $pos ))"
	outfile=${e:0:($index)}
	sips -s format jpeg $2$e --out $3$outfile.jpeg
done  
