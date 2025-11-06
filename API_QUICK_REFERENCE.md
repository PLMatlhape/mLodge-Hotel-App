# 🚀 Quick API Reference Guide

## Base URL
```
http://localhost:5001/api
```

## Authentication
All admin endpoints require:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 📋 Staff Management

### Get All Staff
```http
GET /admin/staff?page=1&limit=10
```

### Create Staff Member
```http
POST /admin/staff
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@mlodge.com",
  "password": "securepassword",
  "role": "staff"
}
```

### Update Staff
```http
PUT /admin/staff/5
Content-Type: application/json

{
  "name": "John Updated",
  "is_active": true
}
```

### Change Password
```http
PATCH /admin/staff/5/password
Content-Type: application/json

{
  "password": "newpassword123"
}
```

### Delete Staff
```http
DELETE /admin/staff/5
```

---

## 🎫 Promo Codes

### Get All Promo Codes
```http
GET /admin/promo-codes?page=1&limit=10
```

### Create Promo Code
```http
POST /admin/promo-codes
Content-Type: application/json

{
  "code": "SUMMER2024",
  "description": "Summer discount",
  "discount_type": "percentage",
  "discount_value": 20,
  "min_purchase_amount": 100,
  "usage_limit": 1000,
  "valid_from": "2024-06-01",
  "valid_until": "2024-08-31",
  "is_active": true
}
```

### Validate Promo Code
```http
POST /admin/promo-codes/validate
Content-Type: application/json

{
  "code": "SUMMER2024"
}
```

### Toggle Active Status
```http
PATCH /admin/promo-codes/5/status
Content-Type: application/json

{
  "is_active": false
}
```

---

## 💰 Refunds

### Get All Refunds
```http
GET /admin/refunds?page=1&limit=10&status=pending
```

### Approve Refund
```http
PATCH /admin/refunds/5/approve
Content-Type: application/json

{
  "admin_notes": "Approved due to valid complaint"
}
```

### Reject Refund
```http
PATCH /admin/refunds/5/reject
Content-Type: application/json

{
  "admin_notes": "Insufficient evidence provided"
}
```

### Mark as Completed
```http
PATCH /admin/refunds/5/process
Content-Type: application/json

{
  "transaction_id": "TXN123456789"
}
```

---

## 📧 Inquiries

### Get All Inquiries
```http
GET /admin/inquiries?page=1&limit=10&status=new&priority=high
```

### Respond to Inquiry
```http
POST /admin/inquiries/5/respond
Content-Type: application/json

{
  "response": "Thank you for contacting us. We will resolve this issue shortly."
}
```

### Update Status
```http
PATCH /admin/inquiries/5/status
Content-Type: application/json

{
  "status": "resolved"
}
```
**Valid statuses:** `new`, `in_progress`, `resolved`, `closed`

### Update Priority
```http
PATCH /admin/inquiries/5/priority
Content-Type: application/json

{
  "priority": "urgent"
}
```
**Valid priorities:** `low`, `medium`, `high`, `urgent`

### Assign to Staff
```http
PATCH /admin/inquiries/5/assign
Content-Type: application/json

{
  "assigned_to": 3
}
```

---

## 📨 Email Templates

### Get All Templates
```http
GET /admin/email-templates?type=booking
```

### Update Template
```http
PUT /admin/email-templates/5
Content-Type: application/json

{
  "subject": "Updated Subject - {{guestName}}",
  "body": "Updated email body with {{variables}}"
}
```

### Send Test Email
```http
POST /admin/email-templates/5/test
Content-Type: application/json

{
  "test_email": "test@example.com",
  "test_data": {
    "guestName": "John Doe",
    "bookingReference": "BK-12345"
  }
}
```

---

## 📊 Reports

### Get All Reports
```http
GET /admin/reports?page=1&limit=10
```

### Generate Report
```http
POST /admin/reports/generate
Content-Type: application/json

{
  "type": "bookings",
  "period": "monthly",
  "date_from": "2024-01-01",
  "date_to": "2024-01-31",
  "format": "csv",
  "filters": {}
}
```

**Report Types:** `bookings`, `revenue`, `occupancy`, `guests`, `custom`  
**Periods:** `daily`, `weekly`, `monthly`, `yearly`, `custom`  
**Formats:** `pdf`, `csv`, `excel`

### Check Report Status
```http
GET /admin/reports/5/status
```

### Download Report
```http
GET /admin/reports/5/download
```

---

## ⭐ Reviews Moderation

### Get All Reviews
```http
GET /reviews/admin/all?page=1&limit=10&status=pending
```

### Get Pending Reviews
```http
GET /reviews/admin/pending?page=1&limit=10
```

### Approve Review
```http
PATCH /reviews/5/approve
```

### Reject Review
```http
PATCH /reviews/5/reject
Content-Type: application/json

{
  "reason": "Contains inappropriate content"
}
```

### Flag Review
```http
PATCH /reviews/5/flag
Content-Type: application/json

{
  "reason": "Suspicious activity detected"
}
```

### Unflag Review
```http
PATCH /reviews/5/unflag
```

---

## 📈 Analytics (Existing)

### Dashboard Stats
```http
GET /admin/dashboard/stats
```

### Revenue Analytics
```http
GET /admin/analytics/revenue?period=month
```

### Booking Trends
```http
GET /admin/bookings/recent?limit=10
```

### Occupancy Rates
```http
GET /admin/analytics/occupancy
```

### User Growth
```http
GET /admin/analytics/user-growth
```

---

## 🔐 Authentication

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@mlodge.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@mlodge.com",
    "role": "admin"
  }
}
```

### Register
```http
POST /auth/register
Content-Type: application/json

{
  "name": "New User",
  "email": "user@example.com",
  "password": "password123"
}
```

---

## 🧪 Testing with cURL

### Example: Approve Refund
```bash
curl -X PATCH http://localhost:5001/api/admin/refunds/5/approve \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"admin_notes": "Approved"}'
```

### Example: Create Promo Code
```bash
curl -X POST http://localhost:5001/api/admin/promo-codes \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "NEWYEAR2024",
    "discount_type": "percentage",
    "discount_value": 15
  }'
```

---

## 📝 Common Response Formats

### Success Response
```json
{
  "id": 5,
  "name": "Updated Resource",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T11:45:00Z"
}
```

### Paginated Response
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

### Error Response
```json
{
  "error": "Resource not found"
}
```

---

## 🎯 Quick Tips

1. **Always include Authorization header** for admin endpoints
2. **Use pagination** for large datasets (`?page=1&limit=10`)
3. **Check status codes**: 200 (OK), 201 (Created), 400 (Bad Request), 401 (Unauthorized), 404 (Not Found), 500 (Server Error)
4. **Filter by status**: Many endpoints support `?status=pending`
5. **Test in order**: Login → Get Token → Test Admin Endpoints

---

## 🔍 Debugging

### Check if server is running:
```bash
curl http://localhost:5001/api/health
```

### Check authentication:
```bash
# Should return 401 Unauthorized
curl http://localhost:5001/api/admin/staff
```

### Test with valid token:
```bash
curl http://localhost:5001/api/admin/staff \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

**Happy Testing! 🚀**
