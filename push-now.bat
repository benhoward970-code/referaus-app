@echo off
cd /d "%~dp0"
git add -A
git commit -m "Fix newsletter to write to newsletter table (not waitlist); tighten rate limit to 3/hr; add phone validation to contact form"
git push
del "%~f0"
