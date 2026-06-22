@echo off
cd /d "%~dp0"
git add -A
git commit -m "Admin dashboard: contacts/newsletter/enquiry CRUD, mark read, reply, delete; DB migration read column on contacts"
git push
del "%~f0"
