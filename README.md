# Portfolio Project

Full-stack portfolio website with a Next.js frontend and Python backend, deployed to Google Cloud.

## Project Structure

- `frontend/` - Next.js 14 frontend with TailwindCSS and TypeScript
- `backend/` - Python backend API 

## Deployment

### Frontend Deployment

The frontend is deployed to Google Cloud Run using the provided deployment script:

```bash
cd frontend
./deploy.sh
```

See `frontend/README.md` for more detailed information.

### Utility Scripts

Several utility scripts are included to help manage the project:

- `cleanup-simple.sh` - Cleans up unused Docker images from Google Container Registry to reduce costs
- `github-sync.sh` - Comprehensive tool to push the project to GitHub with proper authentication handling
- `push-to-github.sh` - Simple script to push to GitHub quickly

### GitHub Integration

To push the entire project to GitHub:

```bash
# For a comprehensive guided experience with authentication handling:
./github-sync.sh

# For a simpler push:
./push-to-github.sh
```

The GitHub sync tool will:
- Initialize git if needed
- Add and commit all files
- Configure the remote repository
- Push to GitHub
- Handle common authentication issues
- Provide clear instructions for SSH and HTTPS

## Maintenance

To clean up unused Docker images from Google Container Registry:

```bash
./cleanup-simple.sh
```

This helps reduce storage costs in Google Cloud by removing old images while keeping the most recent ones and any images tagged as "express".

## Documentation

Detailed documentation for each part of the project can be found in:
- `frontend/README.md` - Frontend documentation
- `backend/README.md` - Backend documentation
