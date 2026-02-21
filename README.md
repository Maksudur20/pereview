# Perfume Review & Discovery System

A full-stack Fragrantica-inspired web application for perfume discovery, reviews, and community discussions.

## Tech Stack

- **Frontend**: React 18, React Router v6, Axios, React Toastify, Google OAuth
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), JWT, Cloudinary
- **Database**: MongoDB Atlas
- **Deployment**: Frontend on Vercel, Backend on Render

## Features

- **Perfume Discovery**: Search, filter by brand/category/price/notes, pagination
- **Detailed Profiles**: Notes pyramid (top/middle/base), sub-ratings (longevity/projection/sillage)
- **Reviews**: Rate perfumes with detailed sub-ratings, one review per user
- **Compare**: Side-by-side fragrance comparison
- **Community**: Discussion board with replies and likes
- **Trending & Recommendations**: Personalized recommendations based on your reviews
- **Admin Dashboard**: Full CRUD with image upload to Cloudinary
- **Authentication**: Email/password + Google OAuth

## Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Cloudinary account
- Google OAuth Client ID

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Fill in your environment variables in .env
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Fill in REACT_APP_API_URL and REACT_APP_GOOGLE_CLIENT_ID
npm start
```

### Environment Variables

**Backend (.env)**:
| Variable | Description |
|---|---|
| PORT | Server port (default 5000) |
| MONGODB_URI | MongoDB connection string |
| JWT_SECRET | Secret for JWT tokens |
| JWT_EXPIRES_IN | Token expiry (e.g. 30d) |
| GOOGLE_CLIENT_ID | Google OAuth client ID |
| CLOUDINARY_CLOUD_NAME | Cloudinary cloud name |
| CLOUDINARY_API_KEY | Cloudinary API key |
| CLOUDINARY_API_SECRET | Cloudinary API secret |
| CLIENT_URL | Frontend URL for CORS |

**Frontend (.env)**:
| Variable | Description |
|---|---|
| REACT_APP_API_URL | Backend API URL |
| REACT_APP_GOOGLE_CLIENT_ID | Google OAuth client ID |

## API Endpoints

### Auth
- `POST /api/auth/register` — Register
- `POST /api/auth/login` — Login
- `POST /api/auth/google` — Google OAuth
- `GET /api/auth/me` — Get profile
- `PUT /api/auth/me` — Update profile
- `POST /api/auth/favorites/:perfumeId` — Toggle favorite

### Perfumes
- `GET /api/perfumes` — List (search, filter, paginate)
- `GET /api/perfumes/:id` — Detail
- `POST /api/perfumes` — Create (admin)
- `PUT /api/perfumes/:id` — Update (admin)
- `DELETE /api/perfumes/:id` — Delete (admin)
- `GET /api/perfumes/:id/similar` — Similar perfumes
- `GET /api/perfumes/compare?ids=id1,id2` — Compare
- `POST /api/perfumes/:id/buy-click` — Track buy click

### Reviews
- `GET /api/reviews/perfume/:perfumeId` — Get reviews
- `POST /api/reviews` — Create review
- `PUT /api/reviews/:id` — Update review
- `DELETE /api/reviews/:id` — Delete review

### Discussions
- `GET /api/discussions` — List discussions
- `POST /api/discussions` — Create discussion
- `GET /api/discussions/:id` — Get discussion
- `POST /api/discussions/:id/replies` — Add reply
- `POST /api/discussions/:id/like` — Toggle like

### Trending & Recommendations
- `GET /api/trending` — Trending perfumes
- `GET /api/trending/top-rated` — Top rated
- `GET /api/recommendations` — Personalized recommendations
