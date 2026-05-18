# nexus
The all-in-one system for getting things done, from managing tasks, budgets, and goals in one place.

## Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- npm (comes with Node.js)

## Setup
This project is a monorepo comprised of a frontend client (React + Typescript) with a backend server (Node.js).

### Quick Start

#### 1. Install Dependencies

**Client:**
```bash
cd client
npm install
```

**Server:**
```bash
cd server
npm install
```

#### 2. Running the Application

**Option A: Run Both Concurrently (Recommended)**

From the root directory, you can run both client and server in separate terminals:

**Terminal 1 - Client (Vite dev server):**
```bash
cd client
npm run dev
```
The client will be available at `http://localhost:5173`

**Terminal 2 - Server:**
```bash
cd server
npm run dev
```
The server will run on the configured port (default: `http://localhost:3000`)

---

### Client

**Location:** `./client`

**Tech Stack:**
- React 19
- TypeScript
- Vite
- ESLint

**Available Scripts:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build locally

**Development:**
```bash
cd client
npm install
npm run dev
```

### Server

**Location:** `./server`

**Tech Stack:**
- Node.js
- Express.js
- TypeScript
- ts-node-dev

**Available Scripts:**
- `npm run dev` - Start development server with auto-reload (ts-node-dev)

**Dependencies:**
- `express` - Web framework
- `cors` - CORS middleware
- `dotenv` - Environment variable management

**Development:**
```bash
cd server
npm install
npm run dev
```

**Environment Setup:**
Create a `.env` file in the server directory if needed:
```
PORT=3000
NODE_ENV=development
```

---

## Project Structure

```
nexus/
├── client/                 # React + Vite frontend
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
├── server/                 # Express.js backend
│   ├── src/
│   ├── package.json
│   └── tsconfig.json
├── docs/                   # Documentation
└── README.md
```

---

## Contributing
1. Create a new branch for your feature
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License
See LICENSE file for details.