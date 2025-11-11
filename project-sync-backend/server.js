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
    'https://project-sync-one.vercel.app' // <-- Your Vercel frontend
];

const corsOptions = {
    origin: function(origin, callback) {
        // allow requests with no origin (like mobile apps or Postman)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
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
app.get('/test', (req, res) => {
    res.send('Test route is working!');
});

app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Connect to MongoDB and start server
connectToMongoDB()
    .then(() => {
        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });
    })
    .catch(err => {
        console.error("Failed to start server due to DB error.", err);
    });
