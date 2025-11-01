# API Testing Guide

## Health Check
```bash
curl http://localhost:5001/api/health
```

## Authentication Tests

### Register New User
```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"name\":\"Test User\",\"password\":\"password123\"}"
```

### Login as Admin
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"Admin@mlodgehotel.co.za\",\"password\":\"Admin@mlodgehotel\"}"
```

Save the token from response, you'll need it for authenticated requests.

### Get Current User (requires token)
```bash
curl http://localhost:5001/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Accommodation Tests

### Get All Accommodations
```bash
curl http://localhost:5001/api/accommodations
```

### Get Single Accommodation with Rooms
```bash
curl http://localhost:5001/api/accommodations/1
```

### Search Accommodations
```bash
# By city
curl "http://localhost:5001/api/accommodations?city=Cape%20Town"

# By price range
curl "http://localhost:5001/api/accommodations?minPrice=2000&maxPrice=5000"

# By guests
curl "http://localhost:5001/api/accommodations?guests=4"

# Search query
curl "http://localhost:5001/api/accommodations?search=luxury"
```

## Room Tests

### Get Rooms by Accommodation
```bash
curl http://localhost:5001/api/rooms/accommodation/1
```

### Check Room Availability (with dates)
```bash
curl "http://localhost:5001/api/rooms/accommodation/1?checkIn=2024-12-20&checkOut=2024-12-25&guests=2"
```

## Booking Tests (requires authentication)

### Create Booking
```bash
curl -X POST http://localhost:5001/api/bookings \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{
    \"accommodation_id\": 1,
    \"check_in_date\": \"2024-12-20\",
    \"check_out_date\": \"2024-12-25\",
    \"rooms\": [{\"room_id\": 1, \"quantity\": 1}],
    \"guest_name\": \"John Doe\",
    \"guest_email\": \"john@example.com\",
    \"guest_phone\": \"+27123456789\",
    \"num_adults\": 2,
    \"num_children\": 0
  }"
```

### Get My Bookings
```bash
curl http://localhost:5001/api/bookings/my-bookings \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Favourites Tests (requires authentication)

### Add to Favourites
```bash
curl -X POST http://localhost:5001/api/favourites \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{\"accommodation_id\": 1}"
```

### Toggle Favourite
```bash
curl -X POST http://localhost:5001/api/favourites/toggle \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{\"accommodation_id\": 1}"
```

### Get My Favourites
```bash
curl http://localhost:5001/api/favourites \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Admin Tests (requires admin token)

### Get Dashboard Stats
```bash
curl http://localhost:5001/api/admin/dashboard/stats \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

### Get All Users
```bash
curl http://localhost:5001/api/users \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

### Get Revenue Analytics
```bash
curl "http://localhost:5001/api/admin/analytics/revenue?period=month" \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

### Get Popular Accommodations
```bash
curl http://localhost:5001/api/admin/analytics/popular-accommodations \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

## PowerShell Testing (Windows)

If curl doesn't work in PowerShell, use Invoke-RestMethod:

### Login Example
```powershell
$body = @{
    email = "Admin@mlodgehotel.co.za"
    password = "Admin@mlodgehotel"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5001/api/auth/login" -Method POST -Body $body -ContentType "application/json"
$token = $response.token
Write-Host "Token: $token"
```

### Get Accommodations with Token
```powershell
$headers = @{
    Authorization = "Bearer $token"
}

$accommodations = Invoke-RestMethod -Uri "http://localhost:5001/api/accommodations" -Method GET -Headers $headers
$accommodations | ConvertTo-Json -Depth 5
```

## Response Examples

### Successful Login Response
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "Admin@mlodgehotel.co.za",
    "name": "Administrator",
    "role": "admin",
    "phone": null
  }
}
```

### Accommodation List Response
```json
[
  {
    "id": 1,
    "name": "mLodge Hotel Cape Town",
    "description": "Luxury hotel in the heart of Cape Town with stunning views",
    "address": "123 Victoria Street",
    "city": "Cape Town",
    "country": "South Africa",
    "star_rating": 5,
    "photos": [],
    "avg_rating": "0",
    "review_count": "0",
    "is_favorite": false
  }
]
```

## Testing with VS Code REST Client

Install the REST Client extension, then create a file `api.http`:

```http
### Health Check
GET http://localhost:5001/api/health

### Login as Admin
POST http://localhost:5001/api/auth/login
Content-Type: application/json

{
  "email": "Admin@mlodgehotel.co.za",
  "password": "Admin@mlodgehotel"
}

### Get Accommodations (use token from login)
GET http://localhost:5001/api/accommodations
Authorization: Bearer YOUR_TOKEN_HERE

### Create Booking
POST http://localhost:5001/api/bookings
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "accommodation_id": 1,
  "check_in_date": "2024-12-20",
  "check_out_date": "2024-12-25",
  "rooms": [{"room_id": 1, "quantity": 1}],
  "guest_name": "John Doe",
  "guest_email": "john@example.com",
  "guest_phone": "+27123456789",
  "num_adults": 2
}
```
