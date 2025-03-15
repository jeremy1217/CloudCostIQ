const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the public directory
app.use(express.static('public'));

// Handle subdomain routing for demo purposes
app.get('/:subdomain/dashboard', (req, res) => {
    const { subdomain } = req.params;
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${subdomain} Dashboard - CloudCostIQ</title>
            <link rel="stylesheet" href="/css/tailwind.min.css">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
            <script src="/js/dashboard.js" defer></script>
            <style>
                .gradient-bg {
                    background: linear-gradient(90deg, #4f46e5 0%, #7e3af2 100%);
                }
                .modal {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.5);
                    z-index: 1000;
                }
                .modal.show {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
            </style>
        </head>
        <body class="bg-gray-100">
            <div class="min-h-screen">
                <nav class="bg-white shadow-sm">
                    <div class="max-w-7xl mx-auto px-4 py-3">
                        <div class="flex justify-between items-center">
                            <div class="flex items-center">
                                <img src="/images/logo.png" alt="CloudCostIQ" class="h-8">
                                <span class="ml-2 text-gray-700">| ${subdomain}</span>
                            </div>
                            <div class="flex items-center space-x-4">
                                <span class="text-sm text-gray-600">Demo Account</span>
                                <button class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                                    Setup Cloud Integration
                                </button>
                            </div>
                        </div>
                    </div>
                </nav>
                
                <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div class="px-4 py-6 sm:px-0">
                        <div class="gradient-bg rounded-lg p-6 text-white">
                            <h1 class="text-2xl font-bold">Welcome to Your CloudCostIQ Dashboard</h1>
                            <p class="mt-2">This is a demo environment. To get started, connect your cloud provider accounts.</p>
                        </div>
                        
                        <div class="mt-8 grid gap-6 grid-cols-1 md:grid-cols-3">
                            <!-- AWS Integration Card -->
                            <div class="provider-card bg-white rounded-lg shadow p-6">
                                <div class="flex items-center justify-between">
                                    <img src="/images/aws-logo.png" alt="AWS" class="h-8">
                                    <span class="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm status-badge">Not Connected</span>
                                </div>
                                <button data-provider="aws" class="mt-4 w-full px-4 py-2 border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50">
                                    <i class="fas fa-plug mr-2"></i>Connect AWS
                                </button>
                            </div>
                            
                            <!-- Azure Integration Card -->
                            <div class="provider-card bg-white rounded-lg shadow p-6">
                                <div class="flex items-center justify-between">
                                    <img src="/images/azure-logo.png" alt="Azure" class="h-8">
                                    <span class="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm status-badge">Not Connected</span>
                                </div>
                                <button data-provider="azure" class="mt-4 w-full px-4 py-2 border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50">
                                    <i class="fas fa-plug mr-2"></i>Connect Azure
                                </button>
                            </div>
                            
                            <!-- GCP Integration Card -->
                            <div class="provider-card bg-white rounded-lg shadow p-6">
                                <div class="flex items-center justify-between">
                                    <img src="/images/gcp-logo.png" alt="GCP" class="h-8">
                                    <span class="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm status-badge">Not Connected</span>
                                </div>
                                <button data-provider="gcp" class="mt-4 w-full px-4 py-2 border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50">
                                    <i class="fas fa-plug mr-2"></i>Connect GCP
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </body>
        </html>
    `);
});

// Catch-all route to serve index.html for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`For demo subdomains, use: http://localhost:${PORT}/[subdomain]/dashboard`);
}); 