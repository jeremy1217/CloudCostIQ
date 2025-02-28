DELETE FROM cloud_cost;
DELETE FROM recommendations;

INSERT INTO cloud_cost (provider, service, cost) VALUES
    ('AWS', 'EC2', 120.50),
    ('Azure', 'Blob Storage', 80.30),
    ('GCP', 'Compute Engine', 95.75);

INSERT INTO recommendations (provider, service, suggestion, command, savings, applied) VALUES
    ('AWS', 'EC2', 'Use Reserved Instances', 'aws ec2 modify-instance-attribute ...', 15.0, 0),
    ('Azure', 'Blob Storage', 'Optimize storage usage', 'az storage blob set-tier ...', 10.0, 0),
    ('GCP', 'Compute Engine', 'Use Committed Use Discounts', 'gcloud compute instances set-scheduling ...', 12.5, 0);
