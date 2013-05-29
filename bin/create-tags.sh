#! /bin/bash

VERBOSE=false
OPTIND=1
while getopts ":vf:" opt; do
    case $opt in
    f)
        OUT_DIR="$OPTARG"
        shift
        if [ $OUT_DIR == "-" ]; then
            # write result to stdout
            OUT_DIR=""
        fi
        ;;

    v)
        VERBOSE=true
        ;;

    \?)
        echo "Invalid option: -$OPTARG"
        exit 1
        ;;
    :)
        echo "Option -$OPTARG requires an argument."
        exit 1
        ;;
    esac
    shift
done

SOURCE=$1

BASE_DIR=$( unset CDPATH && cd "$(dirname $0)/.." && pwd)
LIB_DIR="$BASE_DIR/support/jsdoc-toolkit"
JAR_DIR="$LIB_DIR/jsrun.jar"
APP_DIR="$LIB_DIR/app/run.js"
TPL_DIR="$BASE_DIR/templates/tags"

cmd="node $APP_DIR \
    --template=$TPL_DIR \
    --directory=$OUT_DIR \
    --recurse \
    --private \
    --allfunctions"

if  $VERBOSE ; then
    # verbose mode show additional debug output
    if [ $OUT_DIR ]; then
        echo "[INFO] tags will be saved to $OUT_DIR/tags"
    else
        echo "[INFO] tags will be printed to stdout"
    fi
    echo "[INFO] Processing $SOURCE..."

    cmd="$cmd --verbose $SOURCE"

    echo "RUNNING: $cmd"
else
    # quite mode; no output but the actual result
    cmd="$cmd --quiet $SOURCE"
fi

# execute jsdoc
$cmd
