#! /bin/bash

BASE_DIR=$( unset CDPATH && cd "$(dirname $0)/.." && pwd)
LIB_DIR="$BASE_DIR/support/jsdoc-toolkit"
OUT_DIR="$BASE_DIR/out"
JAR_DIR="$LIB_DIR/jsrun.jar"
APP_DIR="$LIB_DIR/app/run.js"
TPL_DIR="$LIB_DIR/templates/jsdoc"

SOURCE=$1

if [ ! -d $OUT_DIR ]; then
    mkdir -p $OUT_DIR
fi

cmd="java -jar $JAR_DIR $APP_DIR --template=$TPL_DIR --directory=$OUT_DIR $SOURCE"
echo "RUNNING: $cmd"
$cmd
