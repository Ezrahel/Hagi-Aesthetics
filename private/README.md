# Private PDF Storage

This directory contains the Vietnamese Hair Vendor List PDF file.

## Setup Instructions

1. **Place your PDF file here:**
   - File name must be: `vietnamese-hair-vendor-list.pdf`
   - This is the PDF that customers who purchase product03 will be able to download

2. **Security:**
   - This directory is NOT in the `public` folder, so it's not directly accessible via URL
   - Access is controlled through the `/api/download-pdf` endpoint which verifies purchase status
   - Make sure this directory is included in your `.gitignore` if the PDF contains sensitive information

3. **File Location:**
   - The PDF should be placed at: `private/vietnamese-hair-vendor-list.pdf`
   - The API endpoint will serve this file only to authenticated users who have purchased the product

## Testing

After placing the PDF file:
1. Purchase product03 (Vietnamese Hair Vendor List) through the checkout flow
2. Visit the product page: `/shop/vietnamese-hair-vendor-list`
3. You should see a green "📥 Download PDF" button
4. Click it to download the PDF

