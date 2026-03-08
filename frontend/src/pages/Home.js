import React, { useState, useEffect } from 'react';
import { getProperties } from '../services/api';
import PropertyCard from '../components/PropertyCard';
import SearchBar from '../components/SearchBar';

const Home = () => {
    const [properties, setProperties] = useState([]);
    const [filteredProperties, setFilteredProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const { data } = await getProperties();
                setProperties(data);
                setFilteredProperties(data);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch properties. Please try again later.');
                setLoading(false);
            }
        };

        fetchProperties();
    }, []);

    const handleSearch = ({ location, minPrice, maxPrice, type }) => {
        let filtered = properties;

        if (location) {
            filtered = filtered.filter((prop) =>
                prop.location.toLowerCase().includes(location.toLowerCase())
            );
        }

        if (minPrice) {
            filtered = filtered.filter((prop) => prop.price >= Number(minPrice));
        }

        if (maxPrice) {
            filtered = filtered.filter((prop) => prop.price <= Number(maxPrice));
        }

        if (type) {
            filtered = filtered.filter((prop) => prop.type === type);
        }

        setFilteredProperties(filtered);
    };

    if (loading) return <div className="text-center mt-5"><div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div></div>;
    if (error) return <div className="alert alert-danger mt-5">{error}</div>;

    return (
        <>
            <div className="hero-section">
                <div className="container">
                    <h1>Find Your Perfect Home</h1>
                    <p>Discover properties that match your lifestyle</p>
                </div>
            </div>
            <div className="container mt-4 mb-5">
                <SearchBar onSearch={handleSearch} />

                <div className="row g-4">
                    {filteredProperties.length > 0 ? (
                        filteredProperties.map((property) => (
                            <div className="col-12 col-md-6 col-lg-4" key={property._id}>
                                <PropertyCard property={property} />
                            </div>
                        ))
                    ) : (
                        <div className="col-12 text-center text-muted mt-5">
                            <h5>No properties found matching your criteria.</h5>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Home;
