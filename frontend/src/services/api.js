import axios from "axios";

const API_URL = "http://localhost:3000"; // Update if deployed

// Fetch cloud costs (AWS, Azure, GCP)
export const getCloudCosts = async () => {
    try {
        const response = await axios.get(`${API_URL}/costs/ingest`);
        return response.data;
    } catch (error) {
        console.error("Error fetching cloud costs:", error);
        return [];
    }
};

// Get AI-powered cost predictions
export const getCostPredictions = async (data) => {
    try {
        const response = await axios.post(`${API_URL}/insights/predict`, data);
        return response.data;
    } catch (error) {
        console.error("Error fetching cost predictions:", error);
        return null;
    }
};

// Detect cost anomalies
export const getAnomalyDetection = async (data) => {
    try {
        const response = await axios.post(`${API_URL}/insights/anomaly`, data);
        return response.data;
    } catch (error) {
        console.error("Error detecting cost anomalies:", error);
        return null;
    }
};

// Get cost optimization recommendations
export const getOptimizationRecommendations = async () => {
    try {
        const response = await axios.get(`${API_URL}/actions/optimize`);
        return response.data;
    } catch (error) {
        console.error("Error fetching optimization recommendations:", error);
        return [];
    }
};
