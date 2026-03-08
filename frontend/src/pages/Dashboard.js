import React, { useState, useEffect, useContext } from 'react';
import { getProperties, getMyBookings, getOwnerBookings, deleteProperty, updateBookingStatus } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import PropertyCard from '../components/PropertyCard';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [properties, setProperties] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [incomingBookings, setIncomingBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');


    // Default active tab based on role
    const initialTab = user?.role === 'owner' ? 'properties' : 'bookings';
    const [activeTab, setActiveTab] = useState(initialTab);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch user's properties (we fetch all and filter for now)
                const propsRes = await getProperties();
                const userProps = propsRes.data.filter(p =>
                    p.owner && (p.owner._id === user._id || p.owner === user._id)
                );
                setProperties(userProps);

                // Fetch user's bookings
                const booksRes = await getMyBookings();
                setBookings(booksRes.data);

                // Fetch incoming bookings for user's properties
                const incomingBooksRes = await getOwnerBookings();
                setIncomingBookings(incomingBooksRes.data);

                setLoading(false);
            } catch (err) {
                setError('Failed to fetch dashboard data.');
                setLoading(false);
            }
        };

        if (user) {
            fetchData();
        }
    }, [user]);

    const handleDeleteProperty = async (id) => {
        if (window.confirm('Are you sure you want to delete this property?')) {
            try {
                await deleteProperty(id);
                setProperties(properties.filter(p => p._id !== id));
            } catch (err) {
                alert('Failed to delete property');
            }
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            await updateBookingStatus(id, { status });
            setIncomingBookings(incomingBookings.map(b => b._id === id ? { ...b, status } : b));
        } catch (err) {
            alert('Failed to update status');
        }
    };

    if (loading) return <div className="text-center mt-5"><div className="spinner-border"></div></div>;

    return (
        <div className="container mt-4 mb-5">
            <h2 className="mb-4 fw-bold">Welcome, {user?.name}</h2>

            {error && <div className="alert alert-danger">{error}</div>}

            <ul className="nav nav-tabs mb-4">
                {user?.role === 'owner' && (
                    <>
                        <li className="nav-item">
                            <button
                                className={`nav-link text-dark fw-bold ${activeTab === 'properties' ? 'active' : ''}`}
                                onClick={() => setActiveTab('properties')}
                            >
                                My Properties
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link text-dark fw-bold ${activeTab === 'requests' ? 'active' : ''}`}
                                onClick={() => setActiveTab('requests')}
                            >
                                Incoming Requests ({incomingBookings.filter(b => b.status === 'pending').length})
                            </button>
                        </li>
                    </>
                )}
                {(!user?.role || user?.role === 'tenant' || user?.role === 'user') && (
                    <>
                        <li className="nav-item">
                            <button
                                className={`nav-link text-dark fw-bold ${activeTab === 'bookings' ? 'active' : ''}`}
                                onClick={() => setActiveTab('bookings')}
                            >
                                My Bookings
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link text-dark fw-bold ${activeTab === 'pending' ? 'active' : ''}`}
                                onClick={() => setActiveTab('pending')}
                            >
                                Pending Bookings
                            </button>
                        </li>
                    </>
                )}
            </ul>

            {activeTab === 'properties' && (
                <div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h4>Properties you've listed</h4>
                        <Link to="/add-property" className="btn btn-primary btn-sm">Add New Property</Link>
                    </div>

                    <div className="row g-4">
                        {properties.length > 0 ? (
                            properties.map((property) => (
                                <div className="col-12 col-md-6 col-lg-4" key={property._id}>
                                    <div className="card h-100 shadow-sm border-0 rounded-4">
                                        <div className="card-body">
                                            <h5 className="card-title text-truncate">{property.title}</h5>
                                            <p className="card-text">${property.price} / month | {property.location}</p>

                                            <div className="mt-3 d-flex justify-content-between">
                                                <Link to={`/property/${property._id}`} className="btn btn-outline-primary btn-sm">
                                                    View
                                                </Link>
                                                <button
                                                    className="btn btn-outline-danger btn-sm"
                                                    onClick={() => handleDeleteProperty(property._id)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-12">
                                <p className="text-muted">You haven't listed any properties yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'requests' && (
                <div>
                    <h4 className="mb-3">Incoming Booking Requests</h4>

                    <div className="table-responsive bg-white rounded-4 shadow-sm p-3">
                        <table className="table table-hover table-borderless">
                            <thead className="table-light">
                                <tr>
                                    <th>Guest</th>
                                    <th>Property</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {incomingBookings.length > 0 ? (
                                    incomingBookings.map((booking) => (
                                        <tr key={booking._id}>
                                            <td>
                                                {booking.user?.name || 'Unknown'}<br />
                                                <small className="text-muted">{booking.user?.email}</small>
                                            </td>
                                            <td><Link to={`/property/${booking.property?._id}`}>{booking.property?.title || 'Unknown'}</Link></td>
                                            <td>{new Date(booking.bookingDate).toLocaleDateString()}</td>
                                            <td>
                                                <span className={`badge rounded-pill px-3 py-2 ${booking.status === 'approved' ? 'bg-success' :
                                                    booking.status === 'rejected' ? 'bg-danger' : 'bg-warning text-dark'
                                                    }`}>
                                                    {booking.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td>
                                                {booking.status === 'pending' && (
                                                    <div className="btn-group btn-group-sm">
                                                        <button
                                                            className="btn btn-outline-success"
                                                            onClick={() => handleUpdateStatus(booking._id, 'approved')}
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            className="btn btn-outline-danger"
                                                            onClick={() => handleUpdateStatus(booking._id, 'rejected')}
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center text-muted">No booking requests found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'bookings' && (
                <div>
                    <h4 className="mb-3">Properties you've requested to book</h4>

                    <div className="table-responsive">
                        <table className="table table-hover table-bordered">
                            <thead className="table-light">
                                <tr>
                                    <th>Property</th>
                                    <th>Location</th>
                                    <th>Request Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.length > 0 ? (
                                    bookings.map((booking) => (
                                        <tr key={booking._id}>
                                            <td>
                                                <Link to={`/property/${booking.property?._id}`}>
                                                    {booking.property?.title || 'Property Unavailable'}
                                                </Link>
                                            </td>
                                            <td>{booking.property?.location || '-'}</td>
                                            <td>{new Date(booking.bookingDate).toLocaleDateString()}</td>
                                            <td>
                                                <span className={`badge rounded-pill px-3 py-2 ${booking.status === 'approved' ? 'bg-success' :
                                                    booking.status === 'rejected' ? 'bg-danger' : 'bg-warning text-dark'
                                                    }`}>
                                                    {booking.status.toUpperCase()}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center text-muted">No bookings found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'pending' && (
                <div>
                    <h4 className="mb-3">Your Pending Bookings</h4>

                    <div className="table-responsive">
                        <table className="table table-hover table-bordered">
                            <thead className="table-light">
                                <tr>
                                    <th>Property</th>
                                    <th>Location</th>
                                    <th>Request Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.filter(b => b.status === 'pending').length > 0 ? (
                                    bookings.filter(b => b.status === 'pending').map((booking) => (
                                        <tr key={booking._id}>
                                            <td>
                                                <Link to={`/property/${booking.property?._id}`}>
                                                    {booking.property?.title || 'Property Unavailable'}
                                                </Link>
                                            </td>
                                            <td>{booking.property?.location || '-'}</td>
                                            <td>{new Date(booking.bookingDate).toLocaleDateString()}</td>
                                            <td>
                                                <span className={`badge rounded-pill px-3 py-2 bg-warning text-dark`}>
                                                    {booking.status.toUpperCase()}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center text-muted">No pending bookings found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
