# API Endpoint Testing Script
# Tests all major backend endpoints

$baseUrl = "http://localhost:5001/api"
$testResults = @()

Write-Host "`n=== mLodge Hotel API Testing ===" -ForegroundColor Cyan
Write-Host "Testing backend at: $baseUrl`n" -ForegroundColor Gray

# Test 1: Health Check
Write-Host "1. Testing Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/health" -Method GET -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✓ Health check passed" -ForegroundColor Green
        $testResults += "✓ Health check"
    }
} catch {
    Write-Host "   ✗ Health check failed: $_" -ForegroundColor Red
    $testResults += "✗ Health check"
}

# Test 2: Get Accommodations (with pagination)
Write-Host "`n2. Testing GET /accommodations (with pagination)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/accommodations?page=1&limit=5" -Method GET -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    if ($response.StatusCode -eq 200 -and $data.pagination) {
        Write-Host "   ✓ Accommodations endpoint working" -ForegroundColor Green
        Write-Host "   Found $($data.count) accommodations (Page $($data.pagination.page) of $($data.pagination.pages))" -ForegroundColor Gray
        $testResults += "✓ GET /accommodations"
    }
} catch {
    Write-Host "   ✗ Accommodations failed: $_" -ForegroundColor Red
    $testResults += "✗ GET /accommodations"
}

# Test 3: Get Single Accommodation
Write-Host "`n3. Testing GET /accommodations/:id..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/accommodations/1" -Method GET -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        $data = $response.Content | ConvertFrom-Json
        Write-Host "   ✓ Single accommodation endpoint working" -ForegroundColor Green
        Write-Host "   Retrieved: $($data.data.name)" -ForegroundColor Gray
        $testResults += "✓ GET /accommodations/:id"
    }
} catch {
    Write-Host "   ✗ Single accommodation failed: $_" -ForegroundColor Red
    $testResults += "✗ GET /accommodations/:id"
}

# Test 4: Get Rooms for Accommodation
Write-Host "`n4. Testing GET /rooms/accommodation/:id..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/rooms/accommodation/1" -Method GET -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        $data = $response.Content | ConvertFrom-Json
        Write-Host "   ✓ Rooms endpoint working" -ForegroundColor Green
        Write-Host "   Found $($data.count) rooms" -ForegroundColor Gray
        $testResults += "✓ GET /rooms"
    }
} catch {
    Write-Host "   ✗ Rooms failed: $_" -ForegroundColor Red
    $testResults += "✗ GET /rooms"
}

# Test 5: Get Amenities
Write-Host "`n5. Testing GET /amenities..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/amenities" -Method GET -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        $data = $response.Content | ConvertFrom-Json
        Write-Host "   ✓ Amenities endpoint working" -ForegroundColor Green
        Write-Host "   Found $($data.length) amenities" -ForegroundColor Gray
        $testResults += "✓ GET /amenities"
    }
} catch {
    Write-Host "   ✗ Amenities failed: $_" -ForegroundColor Red
    $testResults += "✗ GET /amenities"
}

# Test 6: Auth - Register (should require data)
Write-Host "`n6. Testing POST /auth/register (validation)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/auth/register" -Method POST -UseBasicParsing -ErrorAction SilentlyContinue
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "   ✓ Auth validation working (400 expected)" -ForegroundColor Green
        $testResults += "✓ POST /auth/register"
    } else {
        Write-Host "   ✗ Auth register unexpected error: $_" -ForegroundColor Red
        $testResults += "✗ POST /auth/register"
    }
}

# Test 7: Get Reviews (with pagination)
Write-Host "`n7. Testing GET /reviews/accommodation/:id (with pagination)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/reviews/accommodation/1?page=1&limit=5" -Method GET -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    if ($response.StatusCode -eq 200 -and $data.pagination) {
        Write-Host "   ✓ Reviews endpoint working with pagination" -ForegroundColor Green
        Write-Host "   Found $($data.reviews.length) reviews (Page $($data.pagination.page) of $($data.pagination.pages))" -ForegroundColor Gray
        $testResults += "✓ GET /reviews"
    }
} catch {
    Write-Host "   ✗ Reviews failed: $_" -ForegroundColor Red
    $testResults += "✗ GET /reviews"
}

# Test 8: Protected Route (should return 401)
Write-Host "`n8. Testing Protected Route /bookings/my-bookings (401 expected)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/bookings/my-bookings" -Method GET -UseBasicParsing -ErrorAction SilentlyContinue
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "   ✓ Authentication working (401 expected)" -ForegroundColor Green
        $testResults += "✓ Authentication middleware"
    } else {
        Write-Host "   ✗ Authentication unexpected error: $_" -ForegroundColor Red
        $testResults += "✗ Authentication middleware"
    }
}

# Summary
Write-Host "`n`n=== Test Summary ===" -ForegroundColor Cyan
Write-Host "Completed $($testResults.Count) tests`n" -ForegroundColor Gray

$passed = ($testResults | Where-Object { $_ -like "✓*" }).Count
$failed = ($testResults | Where-Object { $_ -like "✗*" }).Count

foreach ($result in $testResults) {
    if ($result -like "✓*") {
        Write-Host $result -ForegroundColor Green
    } else {
        Write-Host $result -ForegroundColor Red
    }
}

Write-Host "`nPassed: $passed / $($testResults.Count)" -ForegroundColor $(if ($passed -eq $testResults.Count) { "Green" } else { "Yellow" })
Write-Host "Failed: $failed / $($testResults.Count)" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })

if ($passed -eq $testResults.Count) {
    Write-Host "`n✓ All tests passed! Backend is ready for frontend integration." -ForegroundColor Green
} else {
    Write-Host "`n⚠ Some tests failed. Please review and fix issues." -ForegroundColor Yellow
}

Write-Host "`n=== End of Tests ===`n" -ForegroundColor Cyan
