const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory store for demo purposes (replace with a database in production)
const accounts = new Map();
const cloudConnections = new Map();
const costData = new Map();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, 'frontend/build')));

// Serve static files from the public directory
app.use('/public', express.static(path.join(__dirname, 'frontend/public')));

// Authentication middleware
function requireAuth(req, res, next) {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    next();
}

// Registration endpoint
app.post('/api/register', (req, res) => {
    console.log('Registration request received:', {
        body: req.body,
        contentType: req.get('Content-Type')
    });
    
    try {
        // Ensure we have a request body
        if (!req.body || Object.keys(req.body).length === 0) {
            console.error('Empty request body received');
            return res.status(400).json({
                error: 'No data received. Please ensure you\'re sending JSON data.'
            });
        }

        const { name, email, company, plan, password } = req.body;
        
        // Log the extracted data
        console.log('Processing registration for:', { name, email, company, plan });
        
        // Validate required fields
        if (!name || !email || !company || !plan || !password) {
            const missingFields = ['name', 'email', 'company', 'plan', 'password']
                .filter(field => !req.body[field]);
            console.error('Missing required fields:', missingFields);
            
            return res.status(400).json({
                error: `Missing required fields: ${missingFields.join(', ')}`
            });
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                error: 'Invalid email format'
            });
        }
        
        // Create subdomain from company name
        const subdomain = company.toLowerCase()
            .replace(/[^a-z0-9]/g, '') // Remove special characters
            .substring(0, 63); // Max length for subdomains
        
        console.log('Generated subdomain:', subdomain);
        
        // Check if subdomain is available
        if (accounts.has(subdomain)) {
            return res.status(400).json({
                error: 'Company name already registered. Please choose a different name.'
            });
        }
        
        // Store account info (replace with database in production)
        accounts.set(subdomain, {
            name,
            email,
            company,
            plan,
            password: password, // In production, hash the password
            created: new Date(),
            status: 'active'
        });
        
        // Set session data
        req.session.user = {
            subdomain,
            name,
            email,
            plan
        };
        
        // Log successful registration
        console.log('Registration successful for subdomain:', subdomain);
        
        // Set proper content type header
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json({
            success: true,
            subdomain,
            redirectUrl: `/${subdomain}/dashboard`
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            error: 'An error occurred during registration. Please try again.'
        });
    }
});

// Cloud provider connection endpoint
app.post('/api/connect/cloud-provider', requireAuth, (req, res) => {
    try {
        const { provider, credentials } = req.body;
        const { subdomain } = req.session.user;
        
        // Validate provider
        if (!['aws', 'azure', 'gcp'].includes(provider)) {
            return res.status(400).json({
                error: 'Invalid cloud provider'
            });
        }
        
        // Validate credentials (implement proper validation for each provider)
        if (!validateCredentials(provider, credentials)) {
            return res.status(400).json({
                error: 'Invalid credentials'
            });
        }
        
        // Store connection info
        if (!cloudConnections.has(subdomain)) {
            cloudConnections.set(subdomain, new Map());
        }
        
        cloudConnections.get(subdomain).set(provider, {
            credentials,
            status: 'connected',
            lastSync: new Date()
        });
        
        // Initialize cost data storage
        if (!costData.has(subdomain)) {
            costData.set(subdomain, {
                totalCost: 0,
                serviceCosts: {},
                dailyCosts: [],
                lastUpdate: new Date()
            });
        }
        
        res.json({
            success: true,
            message: `Successfully connected to ${provider.toUpperCase()}`
        });
    } catch (error) {
        console.error('Cloud provider connection error:', error);
        res.status(500).json({
            error: 'Failed to connect to cloud provider'
        });
    }
});

// Cost data endpoint
app.get('/api/costs/summary', requireAuth, (req, res) => {
    try {
        const { subdomain } = req.session.user;
        const accountCosts = costData.get(subdomain) || {
            totalCost: 0,
            costChangePercent: 0,
            potentialSavings: 0,
            serviceCosts: {},
            dailyCosts: []
        };
        
        // In production, fetch real data from cloud providers
        // For demo, generate some sample data
        if (accountCosts.totalCost === 0) {
            accountCosts.totalCost = Math.random() * 10000;
            accountCosts.costChangePercent = (Math.random() * 20) - 10;
            accountCosts.potentialSavings = accountCosts.totalCost * 0.2;
            
            // Generate sample service costs
            accountCosts.serviceCosts = {
                'Compute': accountCosts.totalCost * 0.4,
                'Storage': accountCosts.totalCost * 0.3,
                'Network': accountCosts.totalCost * 0.2,
                'Other': accountCosts.totalCost * 0.1
            };
            
            // Generate sample daily costs
            const days = 30;
            accountCosts.dailyCosts = Array.from({ length: days }, (_, i) => ({
                date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                cost: accountCosts.totalCost / days * (0.8 + Math.random() * 0.4)
            }));
            
            costData.set(subdomain, accountCosts);
        }
        
        res.json(accountCosts);
    } catch (error) {
        console.error('Cost data error:', error);
        res.status(500).json({
            error: 'Failed to fetch cost data'
        });
    }
});

// Serve dashboard for subdomains
app.get('/:subdomain/dashboard', (req, res) => {
    const { subdomain } = req.params;
    
    // Check if subdomain exists
    if (!accounts.has(subdomain)) {
        return res.status(404).sendFile(path.join(__dirname, 'frontend/public', '404.html'));
    }
    
    // In production, verify session and ownership
    res.sendFile(path.join(__dirname, 'frontend/public', 'dashboard.html'));
});

// Serve marketing site
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/public', 'marketing.html'));
});

// Utility functions
function validateCredentials(provider, credentials) {
    // Implement proper validation for each provider
    // This is a simplified example
    switch (provider) {
        case 'aws':
            return credentials.accessKeyId && credentials.secretAccessKey;
        case 'azure':
            return credentials.tenantId && credentials.clientId && credentials.clientSecret;
        case 'gcp':
            return credentials.projectId && credentials.keyFile;
        default:
            return false;
    }
}

// Catch all routes and return the React app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`For demo subdomains, use: http://localhost:${PORT}/[subdomain]/dashboard`);
}); 