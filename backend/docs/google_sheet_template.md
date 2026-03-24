# Google Sheet Blog Integration Guide

This guide explains how to set up your Google Sheet to serve as a blog content management system for your portfolio website.

## Google Sheet Structure

Create a sheet with the following columns:

| title | summary | publication_date | thumbnail_url | url | author | reading_time |
|-------|---------|------------------|--------------|-----|--------|--------------|
| Your Blog Post Title | A brief summary of your post | YYYY-MM-DD | Image URL | Link to full post | Your name | X min read |

### Column Details

1. **title**: The headline of your blog post
2. **summary**: A brief description or excerpt (recommended 1-3 sentences)
3. **publication_date**: Date in YYYY-MM-DD format (e.g., 2023-10-15)
4. **thumbnail_url**: URL to an image that represents your post
5. **url**: Link to the full blog post (optional)
6. **author**: Name of the author (optional)
7. **reading_time**: Estimated reading time (optional)

## Example Data

Here's an example row you can add to your sheet:

```
Building a Modern Portfolio Website with Next.js | Learn how to create a dynamic portfolio website using Next.js, React, and Tailwind CSS. This tutorial covers responsive design, dark mode, and data fetching. | 2023-10-15 | https://i.imgur.com/9QHjOtc.jpg | https://medium.com/@yourname/your-post-url | Your Name | 8 min read
```

## Google Sheet Setup

1. Create a new Google Sheet
2. Add the column headers in the first row
3. Add your blog posts, one per row
4. Share the sheet:
   - Click "Share" in the top right
   - Set access to "Anyone with the link can view"
   - Copy the link

5. Extract the Sheet ID from the URL:
   - The URL will look like: `https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit#gid=0`
   - Copy the `YOUR_SHEET_ID` part

6. Update your `.env` file with:
   ```
   SHEET_ID=YOUR_SHEET_ID
   SHEET_NAME=Sheet1  # or whatever you named your sheet
   ```

## Notes

- If your Google Sheet is empty or only contains headers, the system will display default placeholder blog posts
- The sheet will be checked for updates every hour
- You don't need to restart the server after adding new blog posts 