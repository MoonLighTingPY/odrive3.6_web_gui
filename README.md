# ODrive v0.5.6 Web GUI

A comprehensive web-based GUI for ODrive firmware v0.5.6 (conventionally known as v3.6). This GUI provides full configuration, monitoring, and control capabilities for ODrive motor controllers running the specific v0.5.6 firmware.

## Features

### Configuration Tab
- **Step 1: Power Configuration** - DC bus voltage limits, current limits, brake resistor settings
- **Step 2: Motor Configuration** - Motor type, pole pairs, Kv, current limits, calibration parameters
- **Step 3: Encoder Configuration** - Encoder type selection (incremental, Hall, SPI), resolution settings
- **Step 4: Control Configuration** - Control modes, input modes, PID tuning parameters
- **Step 5: Interface Configuration** - CAN bus, UART, GPIO, watchdog timer settings
- **Step 6: Apply Configuration** - Command preview, calibration, save/load configuration

### Dashboard Tab
- Real-time device status monitoring
- Power and thermal monitoring with visual indicators
- Encoder feedback display
- Quick action buttons for common operations
- Live telemetry data with customizable update rates

### Inspector Tab
- Command console for direct ODrive commands
- Property inspector with search and edit capabilities
- Live JSON state viewer
- Command history tracking

### Device Management
- Automatic device scanning and detection
- Connect/disconnect functionality
- Real-time device state monitoring
- Multi-device support

## Technology Stack

### Frontend
- **React.js 19.1.0** - Modern UI framework
- **Chakra UI** - Component library with dark theme
- **Redux Toolkit** - State management
- **Redux Persist** - Configuration persistence
- **Vite** - Fast development and build tool

### Backend
- **Python 3.8+** - Backend runtime
- **Flask** - Web framework
- **ODrive Library v0.5.6** - Device communication
- **Flask-CORS** - Cross-origin support

## Installation

### Prerequisites
- Node.js 16+ and npm
- Python 3.8+
- ODrive firmware v0.5.6 installed on your device

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python start_backend.py
```

The backend API will be available at `http://localhost:5000`

### ODrive Library Installation
```bash
pip install odrive==0.5.6
```

## Usage

1. **Start the Backend**: Run `python start_backend.py` in the backend directory
2. **Start the Frontend**: Run `npm run dev` in the frontend directory
3. **Connect ODrive**: Use the device list to scan and connect to your ODrive
4. **Configure**: Use the configuration tab to set up your motor system
5. **Monitor**: Use the dashboard tab to monitor real-time performance
6. **Debug**: Use the inspector tab for advanced debugging and command execution

## Configuration Steps

### 1. Power Configuration
- Set DC bus overvoltage and undervoltage trip levels
- Configure maximum positive and negative current limits
- Enable and configure brake resistor if present

### 2. Motor Configuration
- Select motor type (High Current or Gimbal)
- Set pole pairs and motor Kv rating
- Configure current limits and calibration parameters
- View calculated torque constant and maximum torque

### 3. Encoder Configuration
- Choose encoder type (Incremental, Hall Effect, SPI Absolute)
- Set encoder resolution (CPR for incremental encoders)
- Configure encoder-specific parameters
- Enable separate commutation encoder if needed

### 4. Control Configuration
- Select control mode (Voltage, Current, Velocity, Position)
- Choose input mode (Passthrough, Velocity Ramp, Trapezoidal Trajectory)
- Tune PID controller gains
- Set velocity and acceleration limits

### 5. Interface Configuration
- Configure CAN bus settings (node ID, baud rate)
- Set up UART communication
- Configure GPIO pin functions
- Enable safety features (watchdog timer)

### 6. Apply Configuration
- Preview generated commands before execution
- Apply configuration temporarily or save permanently
- Perform motor and encoder calibration
- Save configuration to non-volatile memory

## API Endpoints

- `GET /api/odrive/scan` - Scan for ODrive devices
- `POST /api/odrive/connect` - Connect to specific device
- `POST /api/odrive/disconnect` - Disconnect from device
- `GET /api/odrive/state` - Get current device state
- `GET /api/odrive/telemetry` - Get high-frequency telemetry
- `POST /api/odrive/command` - Execute ODrive command
- `POST /api/odrive/set_property` - Set device property
- `POST /api/odrive/apply_config` - Apply configuration
- `POST /api/odrive/calibrate` - Start calibration
- `POST /api/odrive/save_config` - Save configuration

## Building for Production

### Frontend Build
```bash
cd frontend
npm run build
```

### PyInstaller Packaging
```bash
pip install pyinstaller
pyinstaller --onefile --add-data "frontend/dist;frontend/dist" backend/app.py
```

## Troubleshooting

### Common Issues

1. **ODrive Not Detected**
   - Ensure ODrive is connected via USB
   - Check that ODrive firmware v0.5.6 is installed
   - Verify ODrive library installation: `pip list | grep odrive`

2. **Backend Connection Errors**
   - Ensure backend is running on port 5000
   - Check firewall settings
   - Verify CORS configuration

3. **Frontend Build Issues**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check Node.js version compatibility
   - Verify all dependencies are installed

4. **Command Execution Failures**
   - Ensure device is connected and responding
   - Check command syntax for v0.5.6 compatibility
   - Review backend logs for error details

## Version Compatibility

This GUI is specifically designed for ODrive firmware v0.5.6. Command syntax and parameter names may differ from newer firmware versions. Always verify compatibility with your specific firmware version.

## License

This project is open source and available under the MIT License.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review ODrive v0.5.6 documentation
3. Open an issue on the project repository

## Development

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly with ODrive v0.5.6
5. Submit a pull request

### Development Commands
```bash
# Frontend development
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Run ESLint

# Backend development
python app.py    # Start development server
python -m pytest # Run tests (if implemented)
```