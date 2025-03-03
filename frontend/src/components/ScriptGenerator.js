import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, Select, MenuItem, TextField, Button, 
  Paper, IconButton, Snackbar, Alert, FormControl, InputLabel } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import CodeIcon from '@mui/icons-material/Code';

const ScriptGenerator = ({ recommendation, onClose }) => {
  const [scriptType, setScriptType] = useState('aws-cli');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [customParams, setCustomParams] = useState({});
  
  // Helper function to determine if a recommendation is applicable for a script type
  const isApplicable = (type) => {
    const provider = recommendation.provider?.toLowerCase() || '';
    
    // If terraform, all providers are applicable
    if (type === 'terraform') return true;
    
    // Provider specific CLI scripts
    if (type === 'aws-cli' && provider === 'aws') return true;
    if (type === 'az-cli' && provider === 'azure') return true;
    if (type === 'gcloud-cli' && provider === 'gcp') return true;
    
    return false;
  };
  
  // Get script parameters that should be customizable
  const getScriptParams = () => {
    const service = recommendation.service?.toLowerCase() || '';
    const provider = recommendation.provider?.toLowerCase() || '';
    const params = {};
    
    if (scriptType === 'aws-cli') {
      if (service === 'ec2') {
        params.region = 'us-east-1';
        params.instance_id = 'i-0abc123def456789';
      } else if (service === 's3') {
        params.bucket = 'my-bucket';
        params.region = 'us-east-1';
      } else if (service === 'rds') {
        params.db_instance = 'my-db-instance';
        params.region = 'us-east-1';
      }
    } else if (scriptType === 'az-cli') {
      if (service === 'vm') {
        params.resource_group = 'my-resource-group';
        params.vm_name = 'my-vm';
      } else if (service === 'storage') {
        params.account = 'my-storage-account';
        params.resource_group = 'my-resource-group';
      }
    } else if (scriptType === 'gcloud-cli') {
      if (service === 'compute engine') {
        params.zone = 'us-central1-a';
        params.instance = 'my-instance';
      } else if (service === 'cloud storage') {
        params.bucket = 'my-gcs-bucket';
      }
    } else if (scriptType === 'terraform') {
      if (provider === 'aws') {
        if (service === 'ec2') {
          params.region = 'us-east-1';
          params.instance_type = 't3.micro';
        }
      } else if (provider === 'azure') {
        if (service === 'vm') {
          params.location = 'eastus';
          params.vm_size = 'Standard_B1s';
        }
      } else if (provider === 'gcp') {
        if (service === 'compute engine') {
          params.region = 'us-central1';
          params.machine_type = 'e2-micro';
        }
      }
    }
    
    return params;
  };
  
  // Generate the script based on the recommendation and selected script type
  const generateScript = () => {
    const provider = recommendation.provider?.toLowerCase() || '';
    const service = recommendation.service?.toLowerCase() || '';
    const suggestion = recommendation.suggestion || '';
    const params = { ...getScriptParams(), ...customParams };
    
    // Start with a comment explaining the script
    let script = `# Script to implement: ${suggestion}\n`;
    script += `# Provider: ${provider.toUpperCase()}, Service: ${service}\n`;
    script += `# Generated by CloudCostIQ - ${new Date().toISOString().split('T')[0]}\n\n`;
    
    if (scriptType === 'aws-cli') {
      if (service === 'ec2') {
        if (suggestion.includes('Reserved')) {
          script += `# Note: Reserved Instances are purchased through the AWS Console or API\n`;
          script += `# This script helps identify instances to consider for Reserved Instance purchases\n\n`;
          script += `# List instances that are potential candidates for Reserved Instances\n`;
          script += `aws ec2 describe-instances \\
  --region ${params.region} \\
  --query 'Reservations[].Instances[?State.Name==\`running\`].[InstanceId, InstanceType, LaunchTime, Tags[?Key==\`Name\`].Value | [0]]' \\
  --output table\n\n`;
          script += `# For a specific instance, check its usage over time:\n`;
          script += `aws cloudwatch get-metric-statistics \\
  --region ${params.region} \\
  --namespace AWS/EC2 \\
  --metric-name CPUUtilization \\
  --dimensions Name=InstanceId,Value=${params.instance_id} \\
  --start-time $(date -d '30 days ago' --iso-8601=seconds) \\
  --end-time $(date --iso-8601=seconds) \\
  --period 86400 \\
  --statistics Average\n`;
        } else if (suggestion.includes('rightsizing') || suggestion.includes('Rightsizing')) {
          script += `# Resize instance to a more appropriate size based on utilization\n`;
          script += `# 1. Stop the instance\n`;
          script += `aws ec2 stop-instances \\
  --region ${params.region} \\
  --instance-ids ${params.instance_id}\n\n`;
          script += `# 2. Wait for the instance to stop\n`;
          script += `aws ec2 wait instance-stopped \\
  --region ${params.region} \\
  --instance-ids ${params.instance_id}\n\n`;
          script += `# 3. Modify the instance type\n`;
          script += `aws ec2 modify-instance-attribute \\
  --region ${params.region} \\
  --instance-id ${params.instance_id} \\
  --instance-type t3.small\n\n`;
          script += `# 4. Start the instance again\n`;
          script += `aws ec2 start-instances \\
  --region ${params.region} \\
  --instance-ids ${params.instance_id}\n`;
        }
      } else if (service === 's3') {
        if (suggestion.includes('lifecycle')) {
          script += `# Configure S3 lifecycle policy for the bucket\n`;
          script += `cat > lifecycle-config.json << 'EOF'\n`;
          script += `{
  "Rules": [
    {
      "ID": "Move to IA after 30 days",
      "Status": "Enabled",
      "Filter": {
        "Prefix": ""
      },
      "Transitions": [
        {
          "Days": 30,
          "StorageClass": "STANDARD_IA"
        }
      ]
    },
    {
      "ID": "Move to Glacier after 90 days",
      "Status": "Enabled",
      "Filter": {
        "Prefix": ""
      },
      "Transitions": [
        {
          "Days": 90,
          "StorageClass": "GLACIER"
        }
      ]
    }
  ]
}
EOF\n\n`;
          script += `# Apply the lifecycle configuration to the bucket\n`;
          script += `aws s3api put-bucket-lifecycle-configuration \\
  --bucket ${params.bucket} \\
  --lifecycle-configuration file://lifecycle-config.json\n`;
        }
      }
    } else if (scriptType === 'az-cli') {
      if (service === 'vm') {
        if (suggestion.includes('Hybrid Benefit') || suggestion.includes('license')) {
          script += `# Enable Azure Hybrid Benefit for a VM\n`;
          script += `az vm update \\
  --resource-group ${params.resource_group} \\
  --name ${params.vm_name} \\
  --license-type Windows_Server\n`;
        } else if (suggestion.includes('resize') || suggestion.includes('Resize')) {
          script += `# Resize a VM to a more appropriate size\n`;
          script += `# 1. Deallocate the VM\n`;
          script += `az vm deallocate \\
  --resource-group ${params.resource_group} \\
  --name ${params.vm_name}\n\n`;
          script += `# 2. Resize the VM\n`;
          script += `az vm resize \\
  --resource-group ${params.resource_group} \\
  --name ${params.vm_name} \\
  --size Standard_B1ms\n\n`;
          script += `# 3. Start the VM\n`;
          script += `az vm start \\
  --resource-group ${params.resource_group} \\
  --name ${params.vm_name}\n`;
        }
      } else if (service === 'storage') {
        if (suggestion.includes('tier') || suggestion.includes('Tier')) {
          script += `# Change blob access tier to cool for less frequently accessed data\n`;
          script += `az storage blob service-properties update \\
  --account-name ${params.account} \\
  --default-service-version 2019-07-07 \\
  --set-as-default-tier \\
  --tier Cool\n\n`;
          script += `# Set lifecycle management policy\n`;
          script += `cat > lifecycle-policy.json << 'EOF'\n`;
          script += `{
  "rules": [
    {
      "enabled": true,
      "name": "move-to-cool",
      "type": "Lifecycle",
      "definition": {
        "filters": {
          "blobTypes": [ "blockBlob" ]
        },
        "actions": {
          "baseBlob": {
            "tierToCool": { "daysAfterModificationGreaterThan": 30 },
            "tierToArchive": { "daysAfterModificationGreaterThan": 90 },
            "delete": { "daysAfterModificationGreaterThan": 365 }
          }
        }
      }
    }
  ]
}
EOF\n\n`;
          script += `az storage account management-policy create \\
  --account-name ${params.account} \\
  --resource-group ${params.resource_group} \\
  --policy @lifecycle-policy.json\n`;
        }
      }
    } else if (scriptType === 'gcloud-cli') {
      if (service === 'compute engine') {
        if (suggestion.includes('resize') || suggestion.includes('Resize')) {
          script += `# Resize a Google Compute Engine instance\n`;
          script += `# 1. Stop the instance\n`;
          script += `gcloud compute instances stop ${params.instance} \\
  --zone=${params.zone}\n\n`;
          script += `# 2. Set a new machine type\n`;
          script += `gcloud compute instances set-machine-type ${params.instance} \\
  --zone=${params.zone} \\
  --machine-type=e2-small\n\n`;
          script += `# 3. Start the instance\n`;
          script += `gcloud compute instances start ${params.instance} \\
  --zone=${params.zone}\n`;
        } else if (suggestion.includes('commitment') || suggestion.includes('Commitment')) {
          script += `# Note: Committed use discounts are typically purchased through the GCP Console\n`;
          script += `# This script helps analyze usage to make an informed commitment decision\n\n`;
          script += `# Get recommendation for commitment purchase\n`;
          script += `gcloud compute commitments recommender insights list \\
  --project=your-project-id \\
  --location=${params.zone}\n\n`;
          script += `# List instance usage history\n`;
          script += `gcloud compute instances describe ${params.instance} \\
  --zone=${params.zone} \\
  --format="table(name, machineType, status, creationTimestamp)"\n`;
        }
      } else if (service === 'cloud storage') {
        if (suggestion.includes('class') || suggestion.includes('Class')) {
          script += `# Change the default storage class for a bucket\n`;
          script += `gsutil rewrite -s nearline gs://${params.bucket}/**\n\n`;
          script += `# Set a lifecycle rule to automatically transition objects\n`;
          script += `cat > lifecycle.json << 'EOF'\n`;
          script += `{
  "lifecycle": {
    "rule": [
      {
        "action": {
          "type": "SetStorageClass",
          "storageClass": "NEARLINE"
        },
        "condition": {
          "age": 30,
          "matchesStorageClass": ["STANDARD"]
        }
      },
      {
        "action": {
          "type": "SetStorageClass",
          "storageClass": "COLDLINE"
        },
        "condition": {
          "age": 90,
          "matchesStorageClass": ["NEARLINE"]
        }
      }
    ]
  }
}
EOF\n\n`;
          script += `gsutil lifecycle set lifecycle.json gs://${params.bucket}\n`;
        }
      }
    } else if (scriptType === 'terraform') {
      if (provider === 'aws') {
        if (service === 'ec2') {
          script += `# Terraform configuration to implement right-sized EC2 instances\n\n`;
          script += `provider "aws" {
  region = "${params.region}"
}

# Example EC2 instance with optimal sizing
resource "aws_instance" "optimized_instance" {
  ami           = "ami-0c55b159cbfafe1f0"  # Amazon Linux 2 AMI (replace with appropriate AMI)
  instance_type = "${params.instance_type}"
  
  # Enable detailed monitoring for better cost analysis
  monitoring = true
  
  # Add tags for better cost attribution
  tags = {
    Name        = "OptimizedInstance"
    Environment = "Production"
    Project     = "CostOptimization"
  }
}

# Example AWS Instance Scheduler for automated start/stop
resource "aws_autoscaling_schedule" "business_hours" {
  scheduled_action_name  = "business-hours"
  min_size               = 1
  max_size               = 1
  desired_capacity       = 1
  recurrence             = "0 8 * * MON-FRI"  # 8 AM on weekdays
  
  # Link to your Auto Scaling Group (if using one)
  # autoscaling_group_name = aws_autoscaling_group.example.name
}

resource "aws_autoscaling_schedule" "non_business_hours" {
  scheduled_action_name  = "non-business-hours"
  min_size               = 0
  max_size               = 0
  desired_capacity       = 0
  recurrence             = "0 18 * * MON-FRI"  # 6 PM on weekdays
  
  # Link to your Auto Scaling Group (if using one)
  # autoscaling_group_name = aws_autoscaling_group.example.name
}
`;
        } else if (service === 's3') {
          script += `# Terraform configuration for optimized S3 storage\n\n`;
          script += `provider "aws" {
  region = "${params.region}"
}

resource "aws_s3_bucket" "optimized_bucket" {
  bucket = "${params.bucket}"
  
  tags = {
    Name        = "OptimizedStorage"
    Environment = "Production"
    Project     = "CostOptimization"
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "example" {
  bucket = aws_s3_bucket.optimized_bucket.id

  rule {
    id = "transition-to-infrequent-access"
    status = "Enabled"

    filter {
      prefix = ""
    }

    transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }

    transition {
      days          = 90
      storage_class = "GLACIER"
    }

    expiration {
      days = 365
    }
  }
}
`;
        }
      } else if (provider === 'azure') {
        if (service === 'vm') {
          script += `# Terraform configuration for optimized Azure VMs\n\n`;
          script += `provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "example" {
  name     = "${params.resource_group}"
  location = "${params.location}"
  
  tags = {
    Environment = "Production"
    Project     = "CostOptimization"
  }
}

resource "azurerm_linux_virtual_machine" "example" {
  name                  = "optimized-vm"
  resource_group_name   = azurerm_resource_group.example.name
  location              = azurerm_resource_group.example.location
  size                  = "${params.vm_size}"
  admin_username        = "adminuser"
  
  # Use Azure Hybrid Benefit if applicable (for Windows VMs)
  # license_type = "Windows_Server"
  
  network_interface_ids = [
    azurerm_network_interface.example.id,
  ]

  admin_ssh_key {
    username   = "adminuser"
    public_key = file("~/.ssh/id_rsa.pub")  # Replace with your SSH key path
  }

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Standard_LRS"  # Use Standard_LRS for cost optimization
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "UbuntuServer"
    sku       = "18.04-LTS"
    version   = "latest"
  }
  
  tags = {
    Environment = "Production"
    Project     = "CostOptimization"
  }
}

# Auto-shutdown for development VMs to save costs
resource "azurerm_dev_test_global_vm_shutdown_schedule" "example" {
  virtual_machine_id    = azurerm_linux_virtual_machine.example.id
  location              = azurerm_resource_group.example.location
  enabled               = true
  daily_recurrence_time = "2000"  # 8 PM
  timezone              = "UTC"
  
  notification_settings {
    enabled = false
  }
}
`;
        }
      } else if (provider === 'gcp') {
        if (service === 'compute engine') {
          script += `# Terraform configuration for optimized Google Compute Engine\n\n`;
          script += `provider "google" {
  project = "your-project-id"
  region  = "${params.region}"
}

resource "google_compute_instance" "optimized_instance" {
  name         = "optimized-instance"
  machine_type = "${params.machine_type}"
  zone         = "${params.region}-a"

  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-10"
      size  = 20  # GB, adjust as needed
      type  = "pd-standard"  # Use pd-standard for cost savings
    }
  }

  scheduling {
    # Preemptible instances for non-critical workloads (saves up to 80%)
    preemptible = true
    
    # Automatically restart on maintenance
    automatic_restart = false
    
    # Allow node to terminate instance if needed
    on_host_maintenance = "TERMINATE"
  }

  network_interface {
    network = "default"
    access_config {
      # Include this block for external IP
    }
  }

  # Use startup script to optimize instance on boot
  metadata_startup_script = "apt update && apt install -y stackdriver-agent && service stackdriver-agent start"

  service_account {
    scopes = ["cloud-platform"]
  }
  
  labels = {
    environment = "production"
    project     = "cost-optimization"
  }
}

# Instance scheduler for managing uptime
resource "google_cloud_scheduler_job" "instance_scheduler_start" {
  name        = "start-optimized-instance"
  description = "Start compute instance during business hours"
  schedule    = "0 8 * * 1-5"  # 8 AM on weekdays
  region      = "${params.region}"

  http_target {
    uri         = "https://compute.googleapis.com/compute/v1/projects/your-project-id/zones/${params.region}-a/instances/optimized-instance/start"
    http_method = "POST"
    oauth_token {
      service_account_email = "your-service-account@your-project-id.iam.gserviceaccount.com"
    }
  }
}

resource "google_cloud_scheduler_job" "instance_scheduler_stop" {
  name        = "stop-optimized-instance"
  description = "Stop compute instance outside business hours"
  schedule    = "0 18 * * 1-5"  # 6 PM on weekdays
  region      = "${params.region}"

  http_target {
    uri         = "https://compute.googleapis.com/compute/v1/projects/your-project-id/zones/${params.region}-a/instances/optimized-instance/stop"
    http_method = "POST"
    oauth_token {
      service_account_email = "your-service-account@your-project-id.iam.gserviceaccount.com"
    }
  }
}
`;
        }
      }
    }
    
    // Default script if no specific template matched
    if (!script.includes('\n\n')) {
      script = `# ${provider.toUpperCase()} script for ${recommendation.service} optimization\n`;
      script += `# Based on recommendation: ${recommendation.suggestion}\n\n`;
      script += `# Custom script to implement this recommendation would go here\n`;
      script += `# Recommendation command: ${recommendation.command || "N/A"}\n`;
    }
    
    return script;
  };
  
  const handleCopyToClipboard = () => {
    const script = generateScript();
    navigator.clipboard.writeText(script)
      .then(() => {
        setSnackbarMessage('Script copied to clipboard!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      })
      .catch((error) => {
        setSnackbarMessage('Failed to copy script: ' + error.message);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      });
  };
  
  const handleDownload = () => {
    const script = generateScript();
    const provider = recommendation.provider?.toLowerCase() || 'cloud';
    const service = recommendation.service?.toLowerCase() || 'service';
    const extension = scriptType === 'terraform' ? '.tf' : '.sh';
    const filename = `${provider}-${service}-optimization${extension}`;
    
    const blob = new Blob([script], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setSnackbarMessage(`Script downloaded as ${filename}`);
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };
  
  const handleParamChange = (key, value) => {
    setCustomParams({
      ...customParams,
      [key]: value
    });
  };
  
  const scriptTypeOptions = [
    { value: 'aws-cli', label: 'AWS CLI', applicable: isApplicable('aws-cli') },
    { value: 'az-cli', label: 'Azure CLI', applicable: isApplicable('az-cli') },
    { value: 'gcloud-cli', label: 'Google Cloud CLI', applicable: isApplicable('gcloud-cli') },
    { value: 'terraform', label: 'Terraform', applicable: true }
  ].filter(option => option.applicable);
  
  // If no options are available, add Terraform as default
  if (scriptTypeOptions.length === 0) {
    scriptTypeOptions.push({ value: 'terraform', label: 'Terraform', applicable: true });
  }
  
  // Get initial parameters
  const initialParams = getScriptParams();
  
  // Ensure customParams has all expected values when they change
  React.useEffect(() => {
    const newParams = getScriptParams();
    const updatedParams = { ...customParams };
    let changed = false;
    
    // Add any new params
    Object.keys(newParams).forEach(key => {
      if (!customParams.hasOwnProperty(key)) {
        updatedParams[key] = newParams[key];
        changed = true;
      }
    });
    
    // Remove any params no longer needed
    Object.keys(customParams).forEach(key => {
      if (!newParams.hasOwnProperty(key)) {
        delete updatedParams[key];
        changed = true;
      }
    });
    
    if (changed) {
      setCustomParams(updatedParams);
    }
  }, [scriptType]);
  
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
            <CodeIcon sx={{ mr: 1 }} /> Generate Script
          </Typography>
          <Button variant="outlined" size="small" onClick={onClose}>
            Close
          </Button>
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Recommendation: {recommendation.suggestion}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Provider: {recommendation.provider}, Service: {recommendation.service}
          </Typography>
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
            <InputLabel id="script-type-label">Script Type</InputLabel>
            <Select
              labelId="script-type-label"
              id="script-type-select"
              value={scriptType}
              onChange={(e) => setScriptType(e.target.value)}
              label="Script Type"
            >
              {scriptTypeOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {Object.keys(initialParams).length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Customize Parameters
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                {Object.keys(initialParams).map(key => (
                  <TextField
                    key={key}
                    label={key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    variant="outlined"
                    size="small"
                    value={customParams[key] || initialParams[key]}
                    onChange={(e) => handleParamChange(key, e.target.value)}
                  />
                ))}
              </Box>
            </Box>
          )}
        </Box>
        
        <Paper 
          variant="outlined" 
          sx={{ 
            p: 2, 
            backgroundColor: '#f5f5f5', 
            maxHeight: '300px', 
            overflow: 'auto',
            fontFamily: 'monospace',
            fontSize: '0.85rem',
            whiteSpace: 'pre',
            mb: 2
          }}
        >
          {generateScript()}
        </Paper>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button 
            variant="outlined" 
            startIcon={<ContentCopyIcon />}
            onClick={handleCopyToClipboard}
          >
            Copy
          </Button>
          <Button 
            variant="contained" 
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
          >
            Download
          </Button>
        </Box>
      </CardContent>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Card>
  );
};

export default ScriptGenerator;