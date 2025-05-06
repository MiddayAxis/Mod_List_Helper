# Mod List Helper

A desktop application for managing your mod collections. Keep track of mod names, website links, and descriptions in an easy-to-use interface.

## Features

- Add, edit, and delete mods in your collection
- Store mod names, website links, and descriptions
- Import and export your mod list as CSV files
- Cross-platform support (Windows, macOS, Linux)
- Data is saved locally on your computer

## Installation

### Pre-built Binaries

1. Download the latest release for your operating system from the releases page
2. Run the installer
3. Launch the Mod List Helper application

### Building from Source

If you want to build the application yourself:

1. Make sure you have [Node.js](https://nodejs.org/) installed (version 14 or higher)
2. Clone this repository or download the source code
3. Open a terminal in the project directory
4. Install dependencies:
   ```
   npm install
   ```
5. Start the application in development mode:
   ```
   npm start
   ```
6. Build the application for your platform:
   ```
   npm run build
   ```

## Usage

1. **Adding a mod**: Fill in the mod name, website link (optional), and description (optional) in the form at the top, then click "Add Mod"
2. **Editing a mod**: Click the "Edit" button next to any mod to modify its details
3. **Deleting a mod**: Click the "Delete" button next to any mod to remove it from your list
4. **Importing mods**: Click the "Import CSV" button to import a CSV file with mod data
5. **Exporting mods**: Click the "Export CSV" button to save your mod list as a CSV file

## CSV Format

When importing or exporting CSV files, the format should be:

```
Name,Website,Description
"Mod Name 1","https://example.com/mod1","This is a description for mod 1"
"Mod Name 2","https://example.com/mod2","This is a description for mod 2"
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
