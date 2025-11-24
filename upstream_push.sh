npm run build

RESULT=$?
if [ $RESULT != 0 ]; then
    echo "Aborting on $RESULT, command failed:"
    echo "npm run build ..."
    exit $RESULT
fi

npm version minor --no-git-tag-version

RESULT=$?
if [ $RESULT != 0 ]; then
    echo "Aborting on $RESULT, command failed:"
    echo "npm version ..."
    exit $RESULT
fi


git add .

RESULT=$?
if [ $RESULT != 0 ]; then
    echo "Aborting on $RESULT, command failed:"
    echo "git add ..."
    exit $RESULT
fi

git commit -a -m "$1"

RESULT=$?
if [ $RESULT != 0 ]; then
    echo "Aborting on $RESULT, command failed:"
    echo "git commit ..."
    exit $RESULT
fi


git push

RESULT=$?
if [ $RESULT != 0 ]; then
    echo "Aborting on $RESULT, command failed:"
    echo "git push ..."
    exit $RESULT
fi


# This repo is not in npmjs

