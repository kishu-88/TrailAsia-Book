@echo off
setlocal enabledelayedexpansion
REM ---------------------------------------------------------------------------
REM  TrailAsia Book — starts the TrailAsia API and this site's web client,
REM  each in its own window. Double-click from Explorer, or run from cmd.
REM
REM  This site has no database of its own — it talks to the TrailAsia API for
REM  everything (destinations, enquiries, traveller sign-in). So this script
REM  starts that API first (from the sibling ..\TrailAsia\server checkout)
REM  and waits until it actually answers on /health before starting this
REM  site's client. Same reasoning as TrailAsia's own start.bat: starting them
REM  together means the client's first request sometimes lands before the API
REM  is listening.
REM
REM  This site's own server\ (the production static host + API proxy) is not
REM  started here — in development the client's own Vite dev server proxies
REM  straight to the TrailAsia API (see client\vite.config.js), so server\ is
REM  only needed for a production build. See README.md.
REM
REM  Safe to run twice — if something is already listening on a port, it is
REM  checked (not just assumed) to actually be the right process before being
REM  left alone rather than started again. A port held by something else, or
REM  by a stale process left over from a previous run, fails loudly with a
REM  way to clear it rather than silently skipping that window.
REM ---------------------------------------------------------------------------

set "ROOT=%~dp0"
set "API_DIR=%ROOT%..\TrailAsia\server"
set "CLIENT=%ROOT%client"
set "API_PORT=4000"
set "CLIENT_PORT=5174"

REM --- Checks ------------------------------------------------------------
REM Fail here with something actionable, rather than letting a window open
REM and immediately die with a stack trace the reader has to interpret.

echo ==^> Checking the project

where node >nul 2>&1
if errorlevel 1 (
    echo     Node.js is not installed, or not on your PATH.
    echo     Install Node 20 LTS from https://nodejs.org and reopen this terminal.
    goto :fail
)

where curl >nul 2>&1
if errorlevel 1 (
    echo     curl.exe was not found on your PATH. It ships with Windows 10/11 by
    echo     default; if it is genuinely missing, install it or update Windows.
    goto :fail
)

if not exist "%API_DIR%" (
    echo     Could not find the TrailAsia API at:
    echo         %API_DIR%
    echo     This site depends on that checkout being right next to this one
    echo     ^(..\TrailAsia, a sibling of ..\TrailAsia-Book^). Check the path.
    goto :fail
)
if not exist "%API_DIR%\node_modules" (
    echo     TrailAsia API dependencies are not installed.
    echo     Run this once first, from ..\TrailAsia: setup.bat
    goto :fail
)
if not exist "%API_DIR%\.env" (
    echo     ..\TrailAsia\server\.env is missing — the API cannot start without it.
    echo     Run this once first, from ..\TrailAsia: setup.bat
    goto :fail
)
if not exist "%CLIENT%\node_modules" (
    echo     This site's client dependencies are not installed.
    echo     Run this once first:
    echo         cd client ^&^& npm install
    goto :fail
)

echo     Dependencies and configuration look fine.

REM --- TrailAsia API -----------------------------------------------------

echo.
echo ==^> Starting the TrailAsia API on port %API_PORT%

set "PORT_BUSY="
netstat -ano | findstr ":%API_PORT% " | findstr "LISTENING" >nul 2>&1
if not errorlevel 1 set "PORT_BUSY=1"

if defined PORT_BUSY (
    call :check_health "http://localhost:%API_PORT%/api/v1/health"
    if not errorlevel 1 (
        echo     Already running on %API_PORT% — reusing it.
    ) else (
        call :port_conflict %API_PORT% "the TrailAsia API's /health endpoint"
        goto :fail
    )
) else (
    start "TrailAsia API" cmd /k "cd /d "%API_DIR%" && npm run dev"
    echo     waiting for it to answer
    call :wait_for "http://localhost:%API_PORT%/api/v1/health" 60
    if errorlevel 1 (
        echo.
        echo     The API did not respond on port %API_PORT% within 60 seconds.
        echo     Check the "TrailAsia API" window. The usual causes are:
        echo       - MySQL is not running        ^(ECONNREFUSED 127.0.0.1:3306^)
        echo       - the database does not exist  ^(run ..\TrailAsia\setup.bat^)
        echo       - DB_PASSWORD or JWT_SECRET is missing from ..\TrailAsia\server\.env
        goto :fail
    )
    echo.
    echo     API is up at http://localhost:%API_PORT%/api/v1
)

REM --- TrailAsia Book client ---------------------------------------------

echo.
echo ==^> Starting the TrailAsia Book client on port %CLIENT_PORT%

set "PORT_BUSY="
netstat -ano | findstr ":%CLIENT_PORT% " | findstr "LISTENING" >nul 2>&1
if not errorlevel 1 set "PORT_BUSY=1"

if defined PORT_BUSY (
    call :check_health "http://localhost:%CLIENT_PORT%/"
    if not errorlevel 1 (
        echo     Already running on %CLIENT_PORT% — reusing it.
    ) else (
        call :port_conflict %CLIENT_PORT% "like the TrailAsia Book client"
        goto :fail
    )
) else (
    start "TrailAsia Book client" cmd /k "cd /d "%CLIENT%" && npm run dev"
    echo     waiting for it to answer
    call :wait_for "http://localhost:%CLIENT_PORT%/" 30
    if errorlevel 1 (
        echo.
        echo     The client did not respond on port %CLIENT_PORT% within 30 seconds.
        echo     Check the "TrailAsia Book client" window for the actual error.
        goto :fail
    )
    echo.
    echo     Client is up at http://localhost:%CLIENT_PORT%
)

REM --- Done ----------------------------------------------------------------

echo.
echo TrailAsia Book is running.
echo.
echo   Web client   http://localhost:%CLIENT_PORT%
echo   API          http://localhost:%API_PORT%/api/v1  ^(shared with TrailAsia^)
echo.
echo   No account needed to browse destinations or send an enquiry.
echo   Sign-in only works for a traveller who already has portal access —
echo   that's issued from the TrailAsia staff app, from an existing booking's
echo   traveller record ^("Invite to portal"^). There is no seeded traveller
echo   login for this site.
echo.
echo   Close the two terminal windows to stop.
echo.

timeout /t 2 /nobreak >nul
start "" "http://localhost:%CLIENT_PORT%"

exit /b 0

:fail
echo.
pause
exit /b 1

REM --- Subroutines ---------------------------------------------------------

REM %1 = url (quoted). Returns errorlevel 0 if it answers with 2xx/3xx,
REM non-zero otherwise (connection refused, timeout, or an error status).
:check_health
curl -s -o nul -m 3 --fail %1 >nul 2>&1
exit /b %errorlevel%

REM %1 = port, %2 = what should be answering there (quoted). Prints the
REM standard "something else is on this port" message.
:port_conflict
echo     Port %~1 is in use, but nothing there is answering %~2.
echo     This is usually a process left over from an earlier run whose window
echo     you closed without stopping it, or a different app using the same port.
echo     Find and stop it, then run this again:
echo         netstat -ano ^| findstr :%~1
echo         taskkill /PID ^(the PID from the line above^) /F
exit /b 0

REM %1 = url (quoted), %2 = timeout in seconds. Polls once a second.
:wait_for
set "WAIT_URL=%~1"
set /a "WAIT_TRIES=%~2"
:wait_for_loop
call :check_health "%WAIT_URL%"
if not errorlevel 1 exit /b 0
set /a "WAIT_TRIES-=1"
if %WAIT_TRIES% leq 0 exit /b 1
<nul set /p "=."
timeout /t 1 /nobreak >nul
goto :wait_for_loop
