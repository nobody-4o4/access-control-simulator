# Access Control System Simulator

A comprehensive, interactive security access control simulator built with Next.js, React, and TypeScript. This application demonstrates various authentication mechanisms, attack simulations, and defense strategies for educational purposes.

## 🎯 Overview

This Access Control System Simulator is an educational tool designed to demonstrate:

- Multiple authentication methods (PIN, Badge, Fingerprint)
- Security attack simulations (Brute Force, Badge Cloning, Terminal Attacks)
- Defense mechanisms and security monitoring
- Real-time access logging and statistics
- Interactive building visualization with floor plans

## ✨ Features

### Authentication Methods

- **PIN Code Authentication**: Secure PIN-based access control
- **Badge Authentication**: RFID badge scanning system
- **Fingerprint Authentication**: Biometric access control
- **Multi-Factor Authentication**: Combined PIN + Badge verification

### Security Features

- **Attack Simulation Panel**: Test various security attacks
  - Brute Force attacks
  - Badge cloning detection
  - Terminal-based attacks
  - Social engineering attempts
- **Defense Mechanisms**:
  - Maximum attempt limits
  - Alarm system with audio alerts
  - Cloned badge detection
  - Access logging and monitoring
- **Real-time Monitoring**:
  - Access logs with timestamps
  - Security alerts
  - Attack detection logs
  - Statistics dashboard

### User Interface

- **Building Visualization**: Interactive 4-floor building layout
- **Access Control Panel**: Main control interface
- **Statistics Dashboard**: Visual analytics and reports
- **Dark/Light Mode**: Theme support
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18.0 or higher
  - Download from: https://nodejs.org/
  - Verify installation: `node --version`
- **npm**: Version 9.0 or higher (comes with Node.js)

  - Verify installation: `npm --version`

- **Git**: (Optional, for version control)
  - Download from: https://git-scm.com/

## 🚀 Installation

### Step 1: Clone or Download the Project

If you have the project files, navigate to the project directory:

```bash
cd access-control-simulator
```

### Step 2: Install Dependencies

Install all required packages using npm:

```bash
npm install
```

This will install all dependencies listed in `package.json`, including:

- Next.js 16.0.10
- React 19.2.0
- TypeScript 5
- Tailwind CSS 4.1.9
- And other required packages

**Note**: This process may take a few minutes depending on your internet connection.

### Step 3: Verify Installation

Check that all dependencies are installed correctly:

```bash
npm list --depth=0
```

## 🏃 Running the Project

### Development Mode

Start the development server:

```bash
npm run dev
```

The application will be available at:

- **Local**: http://localhost:3000
- **Network**: http://[your-ip]:3000

### Production Build

To create an optimized production build:

```bash
npm run build
```

To start the production server:

```bash
npm start
```

### Other Commands

- **Linting**: `npm run lint` - Check code for errors
- **Type Checking**: The project uses TypeScript for type safety

## 📁 Project Structure

```
access-control-simulator/
├── app/                          # Next.js app directory
│   ├── layout.tsx               # Root layout with metadata
│   ├── page.tsx                 # Home page
│   ├── globals.css              # Global styles
│   ├── syscontrol/              # System control page
│   │   └── page.tsx
│   └── welcome/                 # Welcome/floor plan page
│       └── page.tsx
├── components/                   # React components
│   ├── access-control-simulator.tsx  # Main simulator component
│   ├── theme-provider.tsx       # Theme management
│   └── ui/                      # UI component library
│       ├── button.tsx
│       ├── card.tsx
│       └── ... (other UI components)
├── public/                       # Static assets
│   ├── music/                   # Audio files
│   └── ... (icons and images)
├── lib/                          # Utility functions
│   └── utils.ts
├── hooks/                        # Custom React hooks
├── styles/                       # Additional stylesheets
├── next.config.mjs              # Next.js configuration
├── package.json                 # Project dependencies
├── tsconfig.json                # TypeScript configuration
└── README.md                     # This file
```
