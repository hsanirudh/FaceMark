# Facemark – Group Attendance Monitoring System

A full-stack web application for group attendance tracking using facial recognition technology.

## 🚀 Features

- **Facial Recognition**: Advanced AI-powered face detection using RetinaFace and ArcFace
- **Authentication**: Secure login with NextAuth.js and Google OAuth 2.0
- **Real-time Analytics**: Comprehensive dashboards with Recharts visualization
- **Monitoring**: Prometheus metrics integration with Grafana dashboards
- **Data Export**: CSV/Excel export functionality for attendance records
- **Responsive Design**: Modern UI with shadcn/ui components and Framer Motion animations

## 🎥 Demo

https://github.com/user-attachments/assets/8c58604d-1df9-47f8-9671-79381fd41a50

*Main demo showing facial recognition, dataset management, and real-time analytics*

Watch the video above for a walkthrough of the Facemark system, including facial recognition, dataset management, and real-time analytics in action.

## 🏗️ Architecture

### Monorepo Structure (Turborepo)
```
facemark/
├── apps/
|   ├── web/           # Next.js web application
|   └── ml-service/    # Flask microservice for face recognition
├── infra/
    ├── grafana/       # Grafana Dashboards for visualisation 
    └── prometheus/    # Prometheus for logging and monitoring
    └── nginx/         # Nginx reverse proxy with SSL termination and certificate validation 
```

### Tech Stack

**Frontend & Server:**
- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- shadcn/ui components
- Framer Motion animations
- Recharts for analytics

**Backend ML Service:**
- Python Flask
- RetinaFace (face detection)
- ArcFace (face recognition)
- OpenCV
- scikit-learn

**Database & Auth:**
- PostgreSQL with Prisma ORM
- NextAuth.js with Google OAuth

**Monitoring:**
- Prometheus metrics
- Grafana dashboards

https://github.com/user-attachments/assets/34ad4997-7ed1-4adf-82eb-67f0d08aa5ff

*Grafana dashboard overview and monitoring features*

## 📦 Installation

### Prerequisites
- Node.js 22
- Python 3.12
- PostgreSQL
- pnpm

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/hsanirudh/facemark.git 
`cd facemark
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Environment Configuration**
Copy `apps/web/env.example` to `apps/web/.env` and configure:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/facemark"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
FLASK_SERVICE_URL="http://localhost:5000"
PROMETHEUS_URL="http://localhost:9090"
```

4. **Database Setup**
```bash
cd apps/web
npx prisma migrate dev
npx prisma generate
```

5. **ML Service Setup**
```bash
cd apps/ml-service
pip install -r requirements.txt
```

## 🚀 Running the Application

### Development Mode

1. **Start all services**
```bash
pnpm dev
```

This starts:
- Next.js app on http://localhost:3000
- Flask ML service on http://localhost:5001

### Individual Services

**Web Application:**
```bash
cd apps/web
pnpm dev
```

**ML Service:**
```bash
cd apps/ml-service
python app.py
```

## 📊 Dataset Setup

Create the face recognition dataset in the following structure:

```
apps/ml-service/dataset/
├── Alex/
│   ├── img1.jpg
│   ├── img2.jpg
│   └── img3.jpg
├── Nat/
│   ├── img1.jpg
│   └── img2.jpg
└── ...
```

Each person should have multiple high-quality face images for better recognition accuracy.

## 🔧 API Endpoints

### Web Application APIs
- `POST /api/attendance` - Process attendance with image upload
- `GET /api/attendance` - Fetch attendance records
- `GET /api/metrics` - Prometheus metrics export
- `GET /api/auth/[...nextauth]` - NextAuth endpoints

### ML Service APIs
- `POST /recognize_faces` - Face recognition from image
- `POST /detect_faces` - Face detection only
- `POST /dataset/add` - Add images to dataset
- `GET /dataset/list` - List dataset entries
- `GET /metrics` - ML service metrics
- `GET /health` - Health check

## 📈 Monitoring

### Prometheus Metrics

The application tracks:
- Authentication events
- Attendance processing events
- API request durations
- Face detection/recognition metrics

Access metrics at:
- Web app: http://localhost:3000/api/metrics
- ML service: http://localhost:5000/metrics

### Grafana Dashboard

Import the provided Grafana dashboard configuration to visualize:
- System performance
- Recognition accuracy
- Usage patterns

## 🎨 UI Components

Built with shadcn/ui components:
- Responsive cards and layouts
- Animated buttons and interactions
- Modern typography and spacing

## 🔐 Security Features

- Secure session management
- Input validation and sanitization


## 🚀 Deployment

### Docker Deployment

```bash
# Build and run all the containers with Docker Compose
docker-compose up -d
```

### Production Build

```bash
# Build image using Dockerfile
# You can find the Individual dockerfiles in the apps directory
docker build -t <app_name> .

# Run the container
docker run -p 3000:3000 <app_name>`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 🙋‍♂️ Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Contact the development team

---
