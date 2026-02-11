# RADTH Doctor - Healthcare Platform Frontend

[![React](https://img.shields.io/badge/React-19.1.0-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.7-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-2.8.2-764ABC?logo=redux)](https://redux-toolkit.js.org/)

A modern healthcare platform connecting patients with healthcare providers. Features AI-powered symptom checking, appointment scheduling, and secure OTP-based authentication.

## ✨ Features

### For Patients
- 🔍 **Find Healthcare Providers** - Search and filter doctors by specialty, location, and availability
- 🤖 **AI Symptom Checker** - Get preliminary health insights powered by AI
- 📅 **Easy Appointment Booking** - Book appointments with your preferred doctors
- 👤 **Patient Dashboard** - Manage appointments, view history, and track health records
- 🔐 **Secure Authentication** - OTP-based verification for enhanced security

### For Healthcare Providers
- 📊 **Provider Dashboard** - Manage your practice efficiently
- 📋 **Appointment Management** - View, confirm, and manage patient appointments
- ⚙️ **Profile Management** - Update credentials, specialties, and availability
- 📈 **Performance Analytics** - Track patient engagement and ratings

## 🛠️ Tech Stack

- **Framework:** React 19.1 with TypeScript
- **State Management:** Redux Toolkit with React-Redux
- **Styling:** Tailwind CSS 4.1
- **Routing:** React Router DOM 7.5
- **HTTP Client:** Axios
- **Icons:** Lucide React
- **Build Tool:** Create React App
- **Containerization:** Docker with nginx

## 📁 Project Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── ...
│   ├── pages/              # Page components
│   │   ├── HomePage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   └── ...
│   ├── store/              # Redux store configuration
│   │   ├── index.ts
│   │   ├── authSlice.ts
│   │   └── ...
│   ├── config/             # Configuration files
│   │   └── api.ts
│   ├── App.tsx             # Main application component
│   └── index.tsx           # Application entry point
├── Dockerfile              # Docker configuration
├── nginx.conf              # Nginx configuration for production
├── package.json
└── tsconfig.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/radth-doctor.git
   cd radth-doctor/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Start development server**
   ```bash
   npm start
   ```

   The app will open at [http://localhost:3000](http://localhost:3000)

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start development server |
| `npm run build` | Build for production |
| `npm test` | Run tests |
| `npm run eject` | Eject from Create React App |

## 🐳 Docker Deployment

### Build Docker Image

```bash
docker build -t radth-doctor-frontend \
  --build-arg REACT_APP_API_URL=https://your-api-url.com \
  .
```

### Run Container Locally

```bash
docker run -p 8080:8080 radth-doctor-frontend
```

### Deploy to AWS App Runner

1. **Push to Amazon ECR**
   ```bash
   # Authenticate with ECR
   aws ecr get-login-password --region us-east-2 | \
     docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-2.amazonaws.com

   # Tag image
   docker tag radth-doctor-frontend:latest \
     YOUR_ACCOUNT_ID.dkr.ecr.us-east-2.amazonaws.com/radth-doctor-frontend:latest

   # Push to ECR
   docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-2.amazonaws.com/radth-doctor-frontend:latest
   ```

2. **Create App Runner Service**
   - Go to AWS App Runner Console
   - Choose "Container registry" → "Amazon ECR"
   - Select your image
   - Configure port: `8080`
   - Deploy!

## ⚙️ Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API URL | `http://127.0.0.1:8000` (dev) |

## 🔧 Configuration

### API Configuration

The API URL is configured in `src/config/api.ts`:

- Uses `REACT_APP_API_URL` environment variable if set
- Falls back to `http://127.0.0.1:8000` for local development
- Falls back to production URL for deployed environments

### Nginx Configuration

The `nginx.conf` includes:
- Gzip compression for optimized delivery
- Security headers (X-Frame-Options, X-Content-Type-Options, X-XSS-Protection)
- Static asset caching (1 year for JS, CSS, images)
- React Router SPA support
- Health check endpoint at `/health`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Related

- [Backend API Repository](../backend) - Django REST Framework backend
- [Mobile App](../mobile_app) - React Native mobile application

---

Built with ❤️ for better healthcare accessibility
