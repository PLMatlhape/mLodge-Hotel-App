# Multiple Images Update for Room Inventory

## Overview
Updated the Room Inventory component to support uploading 3-5 images per room instead of just one image.

## Changes Made

### 1. Form Data Structure
**Before:**
```typescript
formData: {
  image: '',  // Single image
}
```

**After:**
```typescript
formData: {
  images: [] as string[],  // Array of images
}

const MAX_IMAGES = 5;
const MIN_IMAGES = 3;
```

### 2. Image Upload Handler
**Key Features:**
- Supports multiple file selection
- Validates maximum of 5 images
- Validates minimum of 3 images (recommendation)
- Compresses each image to 800x600 max at 80% quality
- File size limit: 5MB per image
- Supports JPG/PNG formats

**Logic:**
```typescript
const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  // Check if adding files would exceed MAX_IMAGES
  // Process each file individually
  // Compress and add to images array
}
```

### 3. Image Preview Display
**Before:** Single large preview (h-48)

**After:** Grid layout showing all images
- Grid: 2 columns on mobile, 3 columns on desktop
- Each preview: 128px height (h-32)
- Shows image number badge (1, 2, 3, etc.)
- Individual remove button per image
- "Clear All" button to remove all images

### 4. User Experience Improvements

#### Visual Feedback
- Shows current count: "Room Images (2/5)"
- Dynamic button text:
  - No images: "Upload Images (3-5)"
  - Has images: "Add More (3 left)"
- Warning message if less than 3 images: "Please add at least X more image(s)"

#### Upload Controls
- **Multiple file selection enabled** via `<input multiple>`
- **Upload button** only shows when `images.length < MAX_IMAGES`
- **Clear All button** appears when images exist
- **Individual delete (×)** appears on hover over each image

### 5. Form Validation
```typescript
// Before saving
if (!formData.accommodation_id || !formData.name || !formData.price_per_night) {
  toast.error('Please fill in all required fields');
  return;
}

// Upload validation
if (totalCount > MAX_IMAGES) {
  toast.error(`You can only upload a maximum of ${MAX_IMAGES} images`);
  return;
}
```

## Usage Instructions

### For Users:
1. Click "Add New Room" or "Edit" on existing room
2. Scroll to "Room Images" section
3. Click "Upload Images (3-5)" button
4. Select **multiple images** from file picker (Ctrl+Click or Shift+Click)
5. Each image will be compressed and added to the grid
6. Add up to 5 total images
7. Remove individual images by hovering and clicking ×
8. Or click "Clear All" to remove all images

### Best Practices:
- Upload at least 3 images for better room showcase
- First image will be the primary display image
- Use high-quality images (will be auto-compressed)
- Show different angles of the room
- Include bathroom, bed, view, amenities shots

## Technical Details

### Image Compression
- **Max dimensions:** 800x600 pixels
- **Quality:** 80% JPEG compression
- **Format:** Converts all to JPEG for consistency
- **Storage:** Base64 encoded strings in formData

### State Management
```typescript
// Multiple states work together
const [imagePreviews, setImagePreviews] = useState<string[]>([]);
const [formData, setFormData] = useState({
  images: [] as string[],
  // ... other fields
});
```

### Grid Layout
```tsx
<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
  {imagePreviews.map((preview, index) => (
    <div key={index} className="relative group">
      {/* Image preview with controls */}
    </div>
  ))}
</div>
```

## Benefits

1. **Better Room Showcase:** Multiple angles show rooms comprehensively
2. **User Flexibility:** Upload 3-5 images based on needs
3. **Professional Appearance:** Grid layout looks organized
4. **Easy Management:** Individual delete or clear all options
5. **Guidance:** Clear messages about min/max requirements
6. **Performance:** Auto-compression prevents large file sizes
7. **Validation:** Prevents uploading too many or non-image files

## Testing Checklist

- [ ] Upload single image - works
- [ ] Upload multiple images at once - works
- [ ] Upload up to 5 images total - works
- [ ] Try uploading 6th image - shows error
- [ ] Remove individual image - works
- [ ] Clear all images - works
- [ ] Edit existing room with images - loads correctly
- [ ] Save room with 3 images - works
- [ ] Save room with 5 images - works
- [ ] Try non-image file - shows error
- [ ] Try file over 5MB - shows error

## Future Enhancements

1. **Drag & Drop:** Enable drag-and-drop file upload
2. **Reorder Images:** Allow users to reorder images (set primary)
3. **Image Editor:** Built-in crop/rotate functionality
4. **Cloud Storage:** Upload to cloud instead of base64
5. **Lazy Loading:** Load images progressively on view
6. **Image Captions:** Add optional captions per image
7. **360° View:** Support for panoramic room views

---

**Status:** ✅ Fully Implemented  
**Last Updated:** November 3, 2025  
**Files Modified:** `src/Pages/admin/Inventory.tsx`
