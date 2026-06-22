@echo off
cd /d "%~dp0"
git add -A
git commit -m "feat: Stripe webhooks, review replies on public page, review flag system, unsubscribe mechanism (Spam Act), NDIS disclaimer, data deletion endpoint (Privacy Act), NDIS reg number field, ToS on signup, get-reviews link, live social proof counters, LCP priority images"
git pull origin master --rebase
git push origin HEAD:master
echo.
echo DONE - all changes pushed!
pause
