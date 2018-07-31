@echo off

for /D %%d in ("30\*") do (
  echo ^<^<^<^<^<^< %%d ^>^>^>^>^>^>
  call validate-single.bat %%d
  echo.
)
)