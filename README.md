# SmartBike Tracker 🚲

A full-stack Proof of Concept (PoC) for real-time monitoring of a fleet of smart electric bikes. The project demonstrates the integration between a robust .NET API, based on Clean Architecture principles, and a reactive frontend built with Angular.

## 🌟 Features

* **Real-time Monitoring:** The dashboard retrieves updated fleet data every 5 seconds using RxJS polling.
* **Automated Alerts:** The interface reacts instantly and visually highlights (with red cards) bikes that require attention (e.g., battery level critically low at under 20% or a chain requiring maintenance).
* **Decoupled Architecture:** The backend is structured in layers (Domain, Application, Infrastructure, API) to allow for easy database changes without affecting the business logic.

## 📸 Screenshots

### Fleet Dashboard (Normal Status)
![SmartBike Dashboard Normal](./docs/dashboard-normal.png)

### Triggering a Telemetry Alert
![SmartBike Dashboard Alert](./docs/dashboard-alert.png)

## 🛠️ Technologies Used

### Backend (.NET Core)
* C# & ASP.NET Core Web API
* Clean Architecture & Dependency Injection
* In-Memory Repository (ready to be replaced with Entity Framework Core)
* CORS configured for communication with the frontend

### Frontend (Angular)
* Angular 17+ (Standalone Components, `@if` and `@for` control flow)
* RxJS (`BehaviorSubject`, `switchMap`, `timer` for polling)
* SCSS for a modern and responsive interface

## 📋 Prerequisites

This project was developed and tested on **Windows (win32 x64)** using the following tool versions:

* **.NET SDK:** 10.0.201
* **Node.js:** 24.18.0
* **npm:** 11.18.0
* **Angular CLI:** 22.0.4

Make sure you have these versions (or compatible later versions) installed before attempting to run the application.

## 🚀 How to Run the Project Locally

### 1. Starting the Backend
Navigate to the API folder and run:
```bash
cd SmartBikeTracker.Api
dotnet run
```
The API will start at http://localhost:5009.

### 2. Starting the Frontend
In a separate terminal, navigate to the Angular application folder and run:

```bash
cd smart-bike-tracker-ui
npm install
ng serve
```
The application will be available at http://localhost:4200.