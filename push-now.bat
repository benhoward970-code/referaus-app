@echo off
cd /d "%~dp0"
git add -A
git commit -m "Features: review submission on provider pages, profile view tracking, Stripe billing portal, enquiry confirmation email to senders; DB: view_count column + increment_provider_view RPC"
git push
del "%~f0"
