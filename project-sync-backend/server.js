const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectToMongoDB = require('./db/connection');

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// CORS setup
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://project-sync-one.vercel.app'
];

const corsOptions = {
    origin: function(origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            return callback(new Error(`CORS not allowed from origin: ${origin}`), false);
        }
        return callback(null, true);
    },
    methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization','Accept'],
    exposedHeaders: ['Set-Cookie'],
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Routes
app.use('/user', require('./Routes/user'));
app.use('/team', require('./Routes/team'));
app.use('/invitation', require('./Routes/invitation'));
app.use('/project', require('./Routes/project'));
app.use('/task', require('./Routes/task'));
app.use('/client', require('./Routes/client'));
app.use('/bug', require('./Routes/bug'));

// Test routes
app.get('/test', (req, res) => res.send('Test route is working!'));
app.get('/', (req, res) => res.send('Hello World!'));

// Connect to DB and start server
connectToMongoDB()
    .then(() => app.listen(port, () => console.log(`Server running at http://localhost:${port}`)))
    .catch(err => console.error("DB connection error:", err));
