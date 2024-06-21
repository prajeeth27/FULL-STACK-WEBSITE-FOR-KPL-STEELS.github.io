// Import required libraries
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const csv = require('csv-parser');
const fs = require('fs');
const { SimpleLinearRegression } = require('ml-regression');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

// Initialize Express app and port
const app = express();
const port = 3000;

// Connect to MongoDB
// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/kplsteel', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('MongoDB connected successfully');
    })
    .catch((error) => {
        console.error('MongoDB connection error:', error);
    });

// Define schemas (example)
const employeeSchema = new mongoose.Schema({
    name: String,
    role: String
});

const reviewSchema = new mongoose.Schema({
    text: String
});

const jobSchema = new mongoose.Schema({
    title: String,
    description: String
});

const adminSchema = new mongoose.Schema({
    username: String,
    password: String
});

const Employee = mongoose.model('Employee', employeeSchema);
const Review = mongoose.model('Review', reviewSchema);
const Job = mongoose.model('Job', jobSchema);
const Admin = mongoose.model('Admin', adminSchema);

// Read and preprocess the dataset (example)
const demandData = [];
fs.createReadStream('ProductDemand.csv')
    .pipe(csv())
    .on('data', (row) => {
        demandData.push({
            basePrice: parseFloat(row['Base Price']),
            unitsSold: parseFloat(row['Units Sold']),
            totalPrice: parseFloat(row['Total Price'])
        });
    })
    .on('end', () => {
        console.log('Dataset loaded successfully');

        // Train a simple linear regression model
        const X = demandData.map(row => [row.basePrice, row.unitsSold]); // Input features
        const y = demandData.map(row => row.totalPrice); // Target variable
        const regression = new SimpleLinearRegression(X, y);

        // Endpoint for demand prediction
        app.post('/api/demandPrediction', (req, res) => {
            const { basePrice, unitsSold } = req.body;
            const prediction = regression.predict([basePrice, unitsSold]);
            res.json({ prediction });
        });
    });

// Configure multer for file uploads with unique filenames using UUID
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Define the destination directory for storing uploaded files
    },
    filename: function (req, file, cb) {
        const uniqueIdentifier = uuidv4();
        const fileExtension = file.originalname.split('.').pop();
        cb(null, `${uniqueIdentifier}.${fileExtension}`); // Append unique identifier to the original file name
    }
});
const upload = multer({ storage: storage });

// Use body-parser middleware
app.use(bodyParser.json());

// Enable CORS
app.use(cors());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve uploaded files

// API endpoint to upload file
app.post('/api/uploadFile', upload.single('file'), (req, res) => {
    res.json({ message: 'File uploaded successfully' });
});

// API endpoint to get list of uploaded files
app.get('/api/getUploadedFiles', (req, res) => {
    const uploadDir = path.join(__dirname, 'uploads');
    fs.readdir(uploadDir, (err, files) => {
        if (err) {
            console.error('Error reading upload directory:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json({ files });
        }
    });
});

// API endpoint to fetch all employees
app.get('/api/employees', async (req, res) => {
    try {
        const employees = await Employee.find();
        res.json(employees);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API endpoint to add a new employee
app.post('/api/employees', async (req, res) => {
    const { name, role } = req.body;

    try {
        const newEmployee = new Employee({ name, role });
        const savedEmployee = await newEmployee.save();

        res.json(savedEmployee);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API endpoint to fetch all reviews
app.get('/api/reviews', async (req, res) => {
    try {
        const reviews = await Review.find();
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API endpoint to submit a review
app.post('/api/reviews', async (req, res) => {
    const { text } = req.body;

    try {
        const newReview = new Review({ text });
        const savedReview = await newReview.save();

        res.json(savedReview);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API endpoint to fetch all job opportunities
app.get('/api/jobs', async (req, res) => {
    try {
        const jobs = await Job.find();
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API endpoint to post a job opportunity (for both general and employee job opportunities)
app.post('/api/jobs', async (req, res) => {
    const { title, description } = req.body;

    try {
        const newJob = new Job({ title, description });
        const savedJob = await newJob.save();

        res.json(savedJob);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route for updating admin password
app.put('/api/admin/updatePassword', async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
        // Fetch the admin user
        const admin = await Admin.findOne({ username: 'admin' }); // Adjust query to match your admin username

        // Check if admin exists
        if (!admin) {
            return res.status(404).json({ error: 'Admin not found' });
        }

        // Compare current password
        const isMatch = await bcrypt.compare(currentPassword, admin.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        admin.password = hashedPassword;
        await admin.save();

        res.json({ message: 'Password updated successfully' });

    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
