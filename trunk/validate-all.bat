for /D %%d in ("30/*") do call :process %%~d

:process
if not (%1) == () (
	echo "<<<<<< %1 >>>>>>"
	validate-single.bat 30/%1
)