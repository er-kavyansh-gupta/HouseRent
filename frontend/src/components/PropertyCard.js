import React from 'react';
import { Link } from 'react-router-dom';

const PropertyCard = ({ property }) => {
    const imageUrl = property.image ? `http://localhost:5000/${property.image}` : "https://via.placeholder.com/300x200?text=Property+Image";

    return (
        <div className="property-card-wrapper h-100">
            <div className="card h-100 border-0 rounded-4 shadow-sm">
                {/* Display actual image if available, else placeholder */}
                <img
                    src={imageUrl}
                    className="card-img-top"
                    alt={property.title}
                    style={{ height: '220px', objectFit: 'cover' }}
                />
                <div className="card-body d-flex flex-column">
                    <h5 className="card-title text-truncate">{property.title}</h5>
                    <h6 className="card-subtitle mb-2 text-muted">{property.location}</h6>
                    <p className="card-text text-truncate">{property.description}</p>
                    <div className="mt-auto">
                        <p className="fw-bold mb-2">${property.price} / month</p>
                        <div className="d-flex justify-content-between align-items-center">
                            <span className="badge bg-secondary">{property.type}</span>
                            <Link to={`/property/${property._id}`} className="btn btn-primary btn-sm">
                                View Details
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropertyCard;
