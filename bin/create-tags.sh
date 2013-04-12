#! /bin/bash

SOURCE=$1
OUT_DIR=$2

if [ ! $OUT_DIR ]; then
    OUT_DIR="$PWD"
fi

BASE_DIR=$( unset CDPATH && cd "$(dirname $0)/.." && pwd)
LIB_DIR="$BASE_DIR/support/jsdoc-toolkit"
JAR_DIR="$LIB_DIR/jsrun.jar"
APP_DIR="$LIB_DIR/app/run.js"
TPL_DIR="$BASE_DIR/templates/tags"

echo "### JsDoc Tag Generator ###"
echo "[INFO] Tagfile saved to $OUT_DIR"
echo "[INFO] Processing $SOURCE..."

# execte jsdoc
cmd="java -jar $JAR_DIR $APP_DIR \
    --template=$TPL_DIR \
    --directory=$OUT_DIR \
    --recurse \
    --private \
    --quiet \
    $SOURCE"
#echo "RUNNING: $cmd"
$cmd
