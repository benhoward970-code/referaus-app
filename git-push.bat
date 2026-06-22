@echo off
cd /d "C:\Users\Ben\Desktop\referaus"
echo Staging all changes...
git add -A
set /p MSG="Commit message (or press Enter for auto): "
if "%MSG%"=="" set MSG=chore: update %DATE% %TIME%
git commit -m "%MSG%" --allow-empty
echo Pulling remote changes...
git pull origin master --rebase
echo Pushing...
git push origin HEAD:master
echo.
echo DONE
pause
