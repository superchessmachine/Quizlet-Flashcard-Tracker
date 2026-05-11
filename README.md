# Quizlet Study Tracker

A lightweight browser console script that monitors your Quizlet study progress and estimates completion time.

## Features

- **Real-time Progress Tracking**: Monitors cards completed and remaining in your current study session
- **Multiple ETA Calculations**: Provides estimates based on 30-second, 5-minute, and full session averages
- **Study Speed Metrics**: Shows your current completion rate in cards per minute
- **Completion Time**: Displays estimated finish time to help you plan your study session

## Usage

1. Open Quizlet in your browser and start a study session
2. Open the browser developer console (F12 or Cmd+Shift+I)
3. Copy and paste the script from `src/tracker.js` into the console
4. The tracker will automatically display your progress every second

The console output shows:
- Total progress and remaining cards
- Current time
- Study speed and estimated completion times based on different time windows
- Estimated finish time

To stop tracking, run:
```javascript
clearInterval(window.quizletProgressTracker.interval)
```

## How It Works

The script monitors the progress header element on Quizlet's study page and samples your completion rate every second. It calculates three different ETAs using different time windows to give you both short-term and overall progress trends.
