You are writing a GUI for ODriveFirmware_v3.6-56V.elf(0.5.6 in fact, but conventional name is v3.6). but the version for odrive python lib is 0.6.10.post0. Documentation is available at https://docs.odriverobotics.com/v/0.5.6/getting-started.html.
Also, there is local copy of the documentation available at odrive_docs_local/ downloaded using httrack.
This is an old version of the ODrive firmware, so you should not use the latest version of the documentation.
You should always use the documentation for version 0.5.6, which is available at https://docs.odriverobotics.com/v/0.5.6/getting-started.html.
You should not use the latest version of the documentation, as it may contain features that are not available in this version of the firmware.
The goal is to create a GUI for odrivetool that allows users to interact with the ODrive firmware, configure everything, including sending commands and receiving data.
It should have same functionality as the official ODrive GUI, that is only available for never versions of the firmware.
The gui is intended to be used with the ODrive firmware version 3.6-56V, which is a specific version of the ODrive firmware.
The gui is web-based and uses react.js for the frontend and python for the backend.
The production build should be done using pyinstaller, so the GUI can be run as a standalone application.

i need to write a web gui for odrive v 0.5.6. here are the docs: https://docs.odriverobotics.com/v/0.5.6/getting-started.html .
the gui should help configure the odrive with this specific firmware, as the commands often differ from the one in the new firmware.
it should have a lot of functionality, like read states of all the possible variables, and write them, hace dashboards, everything that's possible.
it will be built using react.js for frontend and python for backend, and later packed into an executable using pyinstaller.
it should have such tabs as: configuration, where you start with configuration of power source as 
step 1: (set dc bus overvoltage trip level, undervoltage trip level, eanble/disabrl and set dc max positive current, negative current.)
then goes step 2: motor configuration, where you set motor parameters, like type(high_current or gimbal), pole pairs, kv, current limit,
motor calib. current, motor calib voltage, lock in spin current. also show calculated KT and current limit torque.
if motor type is gimbal it should also have ability to tweak phase resistance. after that, step 3: encoder configuration.
you choose encoder type, like hal/incremental/spi/rs485. also ability to enable/disable "use separate commutation encoder.
keep in mind that some encoder types have different things to configure. step 4: control mode (like ramped velocity control, psoition, and etc., i dont remember all of them),
and corresponding settings. then step 5: inetrfaces, where you can enable/disable CAN bus, UART, Watchdog timer, GPIO input for control modes,
and for last step 6: 1. "erase old configuration and reboot" button 2. "apply new configuration" button with ability to see which commands are
gonna be executed (minimize and open), 3. "save to non volatile memory and reboot" button, 4. "cailbrate" button, 5. "save to non-volatile memory" button. that's all for configuration tab.
there should also be dashboard and inspector tabs, but lets do it later, lets just make them empty for now. also,
somewhere on the left it should list the odrive dvices, and their state (they hold the values somewhere on their registers).
also a button there to connect/disconnect to odrive. i think that's all for beginning. fully, no placeholders/skips
and no "we will do this later" stuff. just make it fully functional, with all the features described above.
but, if you don't know how to implement something, just ask me, i will help you.
if i ask you to fix someting, and there are just minor changes, just give me that part of the code that needs to be changed, not the whole file.
but if there are reaaaaly major changes, like really a lot in one file - then give me the whole file.