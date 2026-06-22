@echo off
cd /d "C:\Users\Ben\Desktop\referaus"
echo Staging all changes...
git add -A
git commit -m "fix: remove broken cookie auth check in middleware — use client-side auth" --allow-empty
echo Pulling remote changes...
git pull origin master --rebase
echo Pushing...
git push origin HEAD:master
echo.
echo DONE
pause
