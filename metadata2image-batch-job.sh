echo Creating edition images for $1 from $2 to $3 >> build/output.log
for i in $(seq $2 $3)
do
  node src/metadata2image.js $i $1$i.json >> build/output.log &
done