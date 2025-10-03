# Building Health Companion Desktop App

## Prerequisites
- Node.js 18+ installed
- npm installed

## Build Instructions

### For Windows (.exe)
```bash
npm run electron:build:win
```

This will create:
- `dist-electron/Health Companion Setup X.X.X.exe` - Installer

### For macOS (.dmg)
```bash
npm run electron:build:mac
```

This will create:
- `dist-electron/Health Companion-X.X.X.dmg` - Mac installer

### For Linux (.AppImage)
```bash
npm run electron:build:linux
```

This will create:
- `dist-electron/Health Companion-X.X.X.AppImage` - Linux app

### Build for All Platforms
```bash
npm run electron:build
```

## Development Mode

To run the Electron app in development mode:
```bash
npm run electron:dev
```

This will:
1. Start the Vite dev server
2. Launch the Electron app pointing to the dev server
3. Open DevTools automatically

## Output

All built executables will be in the `dist-electron/` directory.

### Windows
- `Health Companion Setup X.X.X.exe` - NSIS installer with install wizard

### macOS
- `Health Companion-X.X.X.dmg` - Drag-and-drop installer

### Linux
- `Health Companion-X.X.X.AppImage` - Portable executable

## Distribution

The installers are self-contained and include:
- All app dependencies
- Electron runtime
- Node.js runtime
- React app bundle

Users can simply download and install without any prerequisites.

## Notes

- Windows builds require Windows OS
- macOS builds require macOS (code signing may require Apple Developer account)
- Linux builds work on most distros
- Cross-platform building may require additional configuration
