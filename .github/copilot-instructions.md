You are writing a GUI for ODriveFirmware_v3.6-56V.elf. Documentation is available at https://docs.odriverobotics.com/v/0.5.6/getting-started.html.
This is an old version of the ODrive firmware, so you should not use the latest version of the documentation.
You should always use the documentation for version 0.5.6, which is available at https://docs.odriverobotics.com/v/0.5.6/getting-started.html.
You should not use the latest version of the documentation, as it may contain features that are not available in this version of the firmware.
The goal is to create a GUI for odrivetool that allows users to interact with the ODrive firmware, configure everything, including sending commands and receiving data.
It should have same functionality as the official ODrive GUI, that is only available for never versions of the firmware.
The gui is intended to be used with the ODrive firmware version 3.6-56V, which is a specific version of the ODrive firmware.
The gui is web-based and uses react.js for the frontend and python for the backend.
The production build should be done using pyinstaller, so the GUI can be run as a standalone application.
