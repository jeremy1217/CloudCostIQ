document.addEventListener('DOMContentLoaded', () => {
    console.log('Dashboard JS loaded'); // Debug log
    
    // Handle cloud provider connection buttons
    const connectButtons = document.querySelectorAll('button[data-provider]');
    console.log('Found connect buttons:', connectButtons.length); // Debug log
    
    if (connectButtons.length === 0) {
        console.error('No buttons found with data-provider attribute');
        return;
    }

    connectButtons.forEach(button => {
        console.log('Adding click listener to button:', button.getAttribute('data-provider'));
        
        button.addEventListener('click', function(e) {
            console.log('Button clicked:', this.getAttribute('data-provider')); // Debug log
            e.preventDefault();
            
            const provider = this.getAttribute('data-provider');
            const statusSpan = this.closest('.provider-card').querySelector('.status-badge');
            
            // Show connecting state
            this.disabled = true;
            this.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i> Connecting...`;
            statusSpan.innerHTML = 'Connecting';
            statusSpan.className = 'px-3 py-1 bg-yellow-100 text-yellow-600 rounded-full text-sm status-badge';
            
            // Simulate connection process
            setTimeout(() => {
                // Update UI to show connected state
                this.innerHTML = `<i class="fas fa-check mr-2"></i> Connected`;
                this.className = 'mt-4 w-full px-4 py-2 bg-green-50 text-green-600 rounded-md cursor-default';
                statusSpan.innerHTML = 'Connected';
                statusSpan.className = 'px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm status-badge';
                
                // Show setup wizard
                showSetupWizard(provider);
            }, 2000);
        });
    });

    // Handle the top navigation "Setup Cloud Integration" button
    const setupButton = document.querySelector('button.bg-indigo-600');
    if (setupButton) {
        setupButton.addEventListener('click', () => {
            const firstNotConnectedButton = document.querySelector('button[data-provider]:not([disabled])');
            if (firstNotConnectedButton) {
                firstNotConnectedButton.click();
            }
        });
    }
});

function showSetupWizard(provider) {
    console.log('Showing setup wizard for:', provider); // Debug log
    
    // Create and show the setup wizard modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4';
    modal.style.zIndex = '1000';
    
    const providerNames = {
        aws: 'AWS',
        azure: 'Azure',
        gcp: 'Google Cloud'
    };
    
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">
                ${providerNames[provider]} Setup Wizard
            </h2>
            <div class="space-y-4">
                <div class="bg-blue-50 p-4 rounded-md">
                    <p class="text-sm text-blue-700">
                        <i class="fas fa-info-circle mr-2"></i>
                        We'll guide you through connecting your ${providerNames[provider]} account securely.
                    </p>
                </div>
                
                <div class="space-y-2">
                    <h3 class="font-medium text-gray-900">Next Steps:</h3>
                    <ul class="space-y-2 text-sm text-gray-600">
                        <li class="flex items-center">
                            <i class="fas fa-check-circle text-green-500 mr-2"></i>
                            Connection established
                        </li>
                        <li class="flex items-center">
                            <i class="fas fa-circle text-gray-300 mr-2"></i>
                            Configure permissions
                        </li>
                        <li class="flex items-center">
                            <i class="fas fa-circle text-gray-300 mr-2"></i>
                            Set up cost monitoring
                        </li>
                        <li class="flex items-center">
                            <i class="fas fa-circle text-gray-300 mr-2"></i>
                            Enable optimization features
                        </li>
                    </ul>
                </div>
                
                <div class="mt-6 space-x-3 flex justify-end">
                    <button onclick="this.closest('.fixed').remove()" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md">
                        Configure Later
                    </button>
                    <button onclick="continueSetup('${provider}')" class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md">
                        Continue Setup
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function continueSetup(provider) {
    console.log('Continuing setup for:', provider); // Debug log
    // Here you would implement the next steps of the setup process
    alert('This would continue the setup process for ' + provider + ' in a real implementation.');
} 