@echo off
cd /d "C:\Users\Ben\Desktop\referaus"
git add -A
git commit -m "fix: full battle-harden pass — settings real email/pw save, dashboard auth guard, open-redirect fix, image type/size validation, checkout rate-limit, contact/newsletter input limits, reset-password listener leak, register pw min 8, report form fixed"
git pull origin master --rebase
git push origin HEAD:master
echo.
echo DONE - all fixes pushed to Vercel
del "%~f0"
pause
