# Chat App

This is the chat app I built to practice building a full small project from start to finish. I worked on the interface, the live chat flow, the backend connection, and the overall structure so it feels more complete than a basic demo.

## What this app does

The app lets a user join with a name, enter the chat, and start sending messages right away. It includes:

- a simple join screen
- group chat messaging
- private message support
- typing indicators
- basic reactions on messages
- a clean layout for chatting

## Project structure

```text
chat-app/
├── back-end/
│   ├── main.py
│   └── requirements.txt
└── front-end/
    ├── src/
    └── package.json
```

## Preview

Here is a simple preview of the app:

![Chat app preview](front-end/src/assets/hero.png)

## How to run

### 1. Start the backend

```bash
cd back-end
pip install -r requirements.txt
uvicorn main:app --reload
```

### 2. Start the frontend

```bash
cd front-end
npm install
npm run dev
```

Then open the local address shown by Vite in your browser.

## Notes

This project was a good way for me to learn how frontend and backend parts work together in a real app. I focused on keeping the flow simple, the UI readable, and the code organized enough to understand easily.
