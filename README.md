# Async Await - Visual Narrator & Multi Language Tutor

![Project Badge](https://img.shields.io/badge/Project-Async%2520Await-blue.svg)
![Team Badge](https://img.shields.io/badge/Team-Classroom%2520of%2520Elite-green.svg)
![Contributors Badge](https://img.shields.io/badge/Contributors-Vishal%2520Pandey%252C%2520S--Mahali-orange.svg)

---

## Overview

**Async Await** is an innovative AI-powered application that combines visual recognition with multi language learning capabilities. The project features two main components:

- **Visual Narrator:** Point your camera at any object and get instant audio descriptions.
- **Multi Language Tutor:** Learn new language or practice conversations and improve pronunciation with your native language by AI tutor available 24/7.

---

## Features

### 🎥 Visual Narrator

- Real-time object recognition through device camera
- Instant audio descriptions of detected objects
- Perfect for travel, learning, and exploration

### 🗣️ Multi Language Tutor

- Interactive multi language  practice
- Pronunciation feedback and correction
- Grammar guidance and vocabulary building
- Support for multiple languages
- Available 24/7 for continuous learning

---

## Technology Stack

### Backend

- Node.js with Express.js server
- Google Speech-to-Text for voice recognition
- Google Gemini for AI reasoning and responses
- Murf Text-to-Speech for natural audio output
- WebSocket for real-time communication

### Frontend

- React.js client application
- Device camera integration
- Real-time audio streaming
- Responsive UI design

---

## Architecture

```
Client (React) → Express Server → AI Services → Audio Response
     ↑               ↓               ↓               ↓
Camera Input   Speech-to-Text    Gemini AI      Murf TTS
     ↑               ↓               ↓               ↓
Visual Input   Transcript      Intelligent    Audio Output
                Processing      Response
```

---

## Installation

### Clone the repository:

```bash
git clone https://github.com/Vishalpandey1799/Aysnc-await.git
cd Aysnc-await
```

### Install dependencies for both server and client:

```bash
# Server dependencies
npm install

# Client dependencies
cd client
npm install
```

### Set up environment variables:

```bash
# Create .env file in server directory
GEMINI_API_KEY=your_gemini_api_key_here
MURF_API_KEY=your_murf_api_key_here
GOOGLE_APPLICATION_CREDENTIALS=path_to_google_credentials.json
```

### Start the development servers:

```bash
# Start backend server (from root directory)
npm run dev

# Start frontend client (from client directory)
npm start
```

---

## Usage

### Visual Narrator Mode

1. Allow camera access when prompted
2. Point your camera at any object
3. Tap the screen to capture and identify the object
4. Listen to the audio description of the object
5. Real-time text display on UI

### Language Tutor Mode

1. Select your native language and target language
2. Speak naturally and receive real-time feedback with correct grammer, vocab, tenses or an enhanced sentences
3. Practice pronunciation with immediate corrections
4. Ask any language related question to improve learning with engagable intresting conversation
   

---

## API Integration

The application integrates with several AI services:

- **Google Gemini:** Provides intelligent responses and reasoning
- **Google Speech-to-Text:** Converts spoken language to text
- **Murf TTS:** Converts text responses to natural speech
- **WebSocket:** Enables real-time bidirectional communication

---

## Contributors

- Vishal Pandey ([@Vishalpandey1799](https://github.com/Vishalpandey1799))
- S-Mahali - ([@soumen](https://github.com/s-mahali))

---

## License

This project is proprietary and developed as part of the Murf AI Coding Challenge 4.

---

## Future Enhancements

- Additional language support
- Advanced grammar correction features
- Vocabulary building games
- Progress tracking and analytics
- Offline mode for limited functionality
- Social features for language practice with others

---

> **Async Await** - Transforming how we see and speak the world around us
