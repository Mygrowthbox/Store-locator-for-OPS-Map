# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/75733c4d-c6fe-44ad-a16d-21e9e91675e4

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/75733c4d-c6fe-44ad-a16d-21e9e91675e4) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/75733c4d-c6fe-44ad-a16d-21e9e91675e4) and click on Share -> Publish.

## 🧭 Project Overview

This project is a **dynamic and interactive store locator** built using OpenStreetMap (OSM) and integrated into a WordPress environment.

It is designed to handle **4000+ points of sale (POS)** while maintaining high performance, usability, and scalability.

The goal is to provide users with a **clean, fast, and intuitive experience** to find stores based on location, category, and other criteria, while allowing administrators to easily manage and update data via CSV import and form submissions.

---

## 🎯 Features & Functional Requirements

### 🗺️ Map Display & Filtering

* The map loads in a **clean, uncluttered state** (no markers displayed initially)
* Markers appear **only when a user interacts**:

  * Applies filters
  * Uses the search bar

#### Filters:

* **Category (Catégorie)**

  * Each category uses a **distinct icon and color**
* **Department (Département)**
* (Extended filtering via listing: Region, Country)

#### Search:

* Users can search by:

  * Address
  * City
  * Postal code

#### Map Behavior:

* Smooth zooming and panning
* Fully responsive (desktop & mobile)
* Marker clustering to prevent overcrowding

---

### 📍 Marker Customization

* Each shop category has:

  * A **unique icon**
  * A **specific color**
* Markers are dynamically loaded (not all at once)
* Clustering groups nearby markers for better readability

---

### 🧾 Shop Listing (Below the Map)

A synchronized listing is displayed below the map.

#### Features:

* Dynamically updates based on filters/search
* Sortable by:

  * Category
  * Department
  * Region
  * Country

#### Each shop displays:

* Name (Nom)
* Category (Catégorie)
* Address (Adresse)
* Additional location details (Complément de localisation)
* Department (Département)
* Region (Région)
* Country (Pays)
* Website (Site web) *(nofollow for SEO)*
* Phone number (Téléphone)
* Image (from CSV URL)

---

### 🔎 SEO Considerations

* External shop links include:

  ```html
  rel="nofollow"
  ```
* Prevents passing link equity to external domains

---

### 🧑‍💻 User Submissions

* Users can submit new shops via a form (WPForms integration)
* Workflow:

  1. User submits a shop
  2. Entry is saved as **pending**
  3. Admin reviews and validates
  4. Approved shops are published and displayed on the map

---

### 📊 Data Management (CSV Import)

* The system supports **bulk import of 4000+ locations**
* Data includes:

  * Name
  * Category
  * Address
  * Latitude / Longitude
  * Image URL
  * Department
  * Region
  * Country
  * Website
  * Phone

#### Requirements:

* Easy updates (edit existing entries)
* Scalable structure for future growth

---

## ⚙️ Technical Architecture

* **Frontend:** React (Lovable)
* **Map:** Leaflet.js (OpenStreetMap)
* **Backend / Data Source:** WordPress (REST API)
* **Forms:** WPForms (user submissions)
* **Data Import:** CSV-based workflow

---

## 🚀 Performance Strategy

To ensure optimal performance with large datasets:

* Markers are **loaded dynamically via filters/search**
* **Clustering** is used to group nearby points
* Avoid loading all 4000+ markers at once
* Designed for scalability and fast rendering

---

## 🔮 Future Improvements

* Advanced API-based filtering (AJAX / REST)
* Geolocation-based search ("near me")
* Improved caching strategies
* Enhanced UI/UX for mobile users
* Admin dashboard improvements for data management

---


Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
