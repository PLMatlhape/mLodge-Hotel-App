# Fix TypeScript type-only import errors

$files = @(
    "routes\accommodations.ts",
    "routes\admin.ts",
    "routes\amenities.ts",
    "routes\analytics.ts",
    "routes\auditLogs.ts",
    "routes\auth.ts",
    "routes\bookings.ts",
    "routes\emailTemplates.ts",
    "routes\favourites.ts",
    "routes\inquiries.ts",
    "routes\notifications.ts",
    "routes\promoCodes.ts",
    "routes\refunds.ts",
    "routes\reports.ts",
    "routes\reviews.ts",
    "routes\rooms.ts",
    "routes\staff.ts",
    "routes\users.ts"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Fixing $file..."
        
        $content = Get-Content $file -Raw
        
        # Fix Response type import
        $content = $content -replace "import express, \{ Response \}", "import express, { type Response }"
        $content = $content -replace "import \{ Router, Response \}", "import { Router, type Response }"
        
        # Fix AuthRequest type import
        $content = $content -replace ", AuthRequest \}", ", type AuthRequest }"
        
        # Save the file
        Set-Content $file -Value $content -NoNewline
        
        Write-Host "✓ Fixed $file"
    }
}

Write-Host "`n✅ All type imports fixed!"
