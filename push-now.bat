@echo off
cd /d "%~dp0"
git add -A
git commit -m "fix: pass auth header string to verifyAdmin in review-flags route (TS build error)"
git pull origin master --rebase
git push origin HEAD:master
echo.
echo DONE - all changes pushed!
pause
