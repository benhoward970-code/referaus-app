@echo off
cd /d "%~dp0"
git add -A
git commit -m "fix: email.ts TS error (never type); add review flags to admin panel; wire notifications settings to DB; respect email_notifications flag on enquiry/review emails"
git pull origin master --rebase
git push origin HEAD:master
echo.
echo DONE - all changes pushed!
pause
