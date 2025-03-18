# CloudCostIQ

CloudCostIQ is a comprehensive cloud cost management platform that helps organizations monitor, analyze, and optimize their cloud spending across AWS, Azure, and GCP.

## Features

- **Multi-cloud Cost Monitoring**: Track costs across AWS, Azure, and GCP in a unified dashboard.
- **AI-Powered Insights**: Leverage machine learning for anomaly detection, cost forecasting, and optimization recommendations.
- **Cost Attribution**: Understand cloud spending by team, project, or environment.
- **Cost Optimization**: Receive actionable recommendations to reduce cloud costs.

## Architecture

The application follows a full-stack architecture:

- **Backend**: Python with FastAPI
- **Frontend**: React with Material-UI
- **Database**: PostgreSQL (recommended for production)
- **AI/ML**: Scikit-learn for anomaly detection and forecasting

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js 14+
- pip
- npm

### Backend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/cloudcostiq.git
   cd cloudcostiq
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Initialize the database with mock data:
   ```bash
   python backend/init_db.py
   ```

5. Start the backend server:
   ```bash
   uvicorn backend.api.main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the frontend development server:
   ```bash
   npm start
   ```

4. Access the application at [http://localhost:3000](http://localhost:3000)

## Development

### Using Mock Data

The application is currently configured to use mock data. The mock data generator creates consistent data for:

- Cloud costs across AWS, Azure, and GCP
- Cost optimization recommendations
- Anomalies and trends

To regenerate mock data:
```bash
python backend/init_db.py
```

### API Documentation

Once the backend is running, you can access the API documentation at:
- Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
- ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

## Project Structure

- **alembic/**: Database migration tools
- **backend/**: Server-side code
  - **ai/**: ML models for anomaly detection, forecasting, and optimization
  - **api/**: FastAPI routes and endpoints
  - **database/**: Database configuration and connection
  - **models/**: SQLAlchemy models
  - **services/**: Business logic and cloud provider integration
  - **utils/**: Helper functions and utilities
- **frontend/**: Client-side code
  - **src/components/**: React components
  - **src/pages/**: Page layouts
  - **src/services/**: API integration
  - **src/context/**: Global state management

## Future Improvements

- Add authentication and user management
- Integrate with actual cloud provider APIs
- Implement more advanced ML models for cost optimization
- Add unit and integration tests
- Deploy to production with Docker and CI/CD

## License

This project is licensed under the MIT License - see the LICENSE file for details.