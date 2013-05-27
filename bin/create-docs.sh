#! /bin/bash

SOURCE=$1
OUT_DIR=$2

if [ ! $OUT_DIR ]; then
    OUT_DIR="$PWD"
fi
OUT_DIR="$OUT_DIR/docs"

if [ -d $OUT_DIR ]; then
    rm -rf $OUT_DIR
fi

BASE_DIR=$( unset CDPATH && cd "$(dirname $0)/.." && pwd)
LIB_DIR="$BASE_DIR/support/jsdoc-toolkit"
JAR_DIR="$LIB_DIR/jsrun.jar"
APP_DIR="$LIB_DIR/app/run.js"
TPL_DIR="$LIB_DIR/templates/jsdoc"

echo "### JsDoc Tag Generator ###"
echo "[INFO] Documentation will be saved to $OUT_DIR"
echo "[INFO] Processing $SOURCE..."

# execte jsdoc
cmd="java -jar $JAR_DIR $APP_DIR \
    --template=$TPL_DIR \
    --directory=$OUT_DIR \
    --recurse \
    --private \
    --allfunctions \
    --quiet \
    $SOURCE"
#echo "RUNNING: $cmd"
$cmd
