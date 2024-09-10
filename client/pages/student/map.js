import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import L from 'leaflet'; // Import Leaflet to create custom icons
import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS for map styling

// Dynamically import React-Leaflet components
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });
const Polygon = dynamic(() => import('react-leaflet').then(mod => mod.Polygon), { ssr: false });

const MapPage = () => {
    const facultyCenterCoordinates = [27.1810, 31.1836]; // Center coordinates for the faculty
    const mainBuildingCoordinates = [27.1808, 31.1837]; // Coordinates for Main Building
    const labsBuildingCoordinates = [27.1812, 31.1839]; // Coordinates for Labs Building

    const [mapLoaded, setMapLoaded] = useState(false);

    useEffect(() => {
        setMapLoaded(true); // This ensures the map components are only rendered on the client
    }, []);

    // Define a common custom icon using Leaflet's icon functionality
    const commonIcon = L.icon({
        iconUrl: '/marker-icon.png', // Common icon path in public/icons directory
        iconSize: [32, 32], // Size of the icon
        iconAnchor: [16, 32], // Point of the icon which will correspond to marker's location
        popupAnchor: [0, -32] // Point from which the popup should open relative to the iconAnchor
    });

    if (!mapLoaded) {
        return null; // This prevents server-side rendering
    }

    return (
        <div>
            <Head>
                <title>Faculty of Computers and Information Map - Assiut University</title>
                <link
                    rel="stylesheet"
                    href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
                />
            </Head>
            <h1>Faculty of Computers and Information - Assiut University</h1>
            <p>Explore the main buildings and facilities within the Faculty of Computers and Information.</p>

            {/* Map Container */}
            <div style={{ height: '600px', width: '100%', maxWidth: '1000px', margin: '0 auto', border: '2px solid #ccc', borderRadius: '10px' }}>
                <MapContainer center={facultyCenterCoordinates} zoom={18} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />

                    {/* Main Building Marker */}
                    <Marker position={mainBuildingCoordinates} icon={commonIcon}>
                        <Popup>
                            <strong>Main Building</strong><br />
                            Consists of Lecture Halls 1 to 9, primarily used for general and specialized lectures.
                        </Popup>
                    </Marker>

                    {/* Labs Building Marker */}
                    <Marker position={labsBuildingCoordinates} icon={commonIcon}>
                        <Popup>
                            <strong>Labs Building</strong><br />
                            - <strong>Ground Floor (0):</strong> Multimedia Major<br />
                            - <strong>1st Floor:</strong> Computer Science Major<br />
                            - <strong>2nd Floor:</strong> Information Systems Major<br />
                            - <strong>3rd Floor:</strong> Information Technology Major<br />
                            - <strong>4th Floor:</strong> High Performance Labs<br />
                            Each floor has labs labeled A to E.
                        </Popup>
                    </Marker>

                    {/* Polygon to highlight the faculty area */}
                    <Polygon positions={[[27.1805, 31.1832], [27.1805, 31.1844], [27.1818, 31.1844], [27.1818, 31.1832]]} color="blue" fillColor="lightblue">
                        <Popup>
                            Faculty of Computers and Information Area
                        </Popup>
                    </Polygon>
                </MapContainer>
            </div>

            {/* Additional Information Section */}
            <div style={{ marginTop: '20px', padding: '0 20px', backgroundColor: '#f9f9f9', borderRadius: '10px' }}>
                <h2>Building Descriptions</h2>
                <p>
                    The <strong>Main Building</strong> is used for lectures and houses Lecture Halls 1 through 9, providing spaces for both general and specialized lectures.
                </p>
                <p>
                    The <strong>Labs Building</strong> includes multiple specialized labs distributed across several floors, each dedicated to specific academic disciplines:
                </p>
                <ul>
                    <li><strong>Ground Floor (0):</strong> Multimedia labs equipped for media production and editing.</li>
                    <li><strong>1st Floor:</strong> Computer Science labs focused on programming and algorithm studies.</li>
                    <li><strong>2nd Floor:</strong> Information Systems labs, specializing in database management and systems design.</li>
                    <li><strong>3rd Floor:</strong> Information Technology labs, including networking and cybersecurity.</li>
                    <li><strong>4th Floor:</strong> High Performance Labs, designed for advanced research in computing.</li>
                </ul>
                <p>
                    Each floor is designed with five labs (A to E) to provide ample space and resources for hands-on learning and experimentation.
                </p>
            </div>
        </div>
    );
};

export default MapPage;