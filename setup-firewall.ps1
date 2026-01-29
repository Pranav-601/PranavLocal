# Configure Windows Firewall for PranavSend
Write-Host "Setting up Windows Firewall rules for PranavSend..." -ForegroundColor Green

# Check if running as administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator"))
{
    Write-Host "This script needs to be run as Administrator!" -ForegroundColor Red
    Write-Host "Right-click on PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    pause
    exit 1
}

try {
    # Add firewall rule for frontend (port 8080)
    Write-Host "Adding firewall rule for Frontend (port 8080)..."
    New-NetFirewallRule -DisplayName "PranavSend Frontend" -Direction Inbound -Protocol TCP -LocalPort 8080 -Action Allow -Profile Any
    
    # Add firewall rule for backend (port 5000)
    Write-Host "Adding firewall rule for Backend (port 5000)..."
    New-NetFirewallRule -DisplayName "PranavSend Backend" -Direction Inbound -Protocol TCP -LocalPort 5000 -Action Allow -Profile Any
    
    Write-Host "Firewall rules added successfully!" -ForegroundColor Green
    Write-Host "Your phone should now be able to access the app at:" -ForegroundColor Yellow
    Write-Host "http://192.168.29.150:8080" -ForegroundColor Cyan
    
} catch {
    Write-Host "Error adding firewall rules: $_" -ForegroundColor Red
}

Write-Host "Press any key to continue..."
$host.UI.ReadLine()
