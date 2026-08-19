# GoTrip

Dummy travel booking website built with Node.js + Express.

## Features

- Flights, Hotels, Buses pages (dummy data)
- Itinerary generator by destination + number of days
- Simple chatbot widget (local `/api/chat` endpoint)

## Run (Command Prompt)

```cmd
cd /d C:\Users\sv185255\gotrip
npm install
npm start
```

Then open `http://localhost:3000`.

## If port 3000 is busy

The server will automatically try `3001`, `3002`, ... if `3000` is already in use.

To force a specific port in **cmd.exe**:

```cmd
cd /d C:\Users\sv185255\gotrip
set PORT=3001
npm start
```

To find and stop what is using port 3000:

```cmd
netstat -ano | findstr :3000
taskkill /PID <PID_FROM_NETSTAT> /F
```
"# GoTrip-Website" 
