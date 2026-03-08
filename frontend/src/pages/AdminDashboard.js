import React, { useState, useEffect, useContext } from 'react';
import { getProperties, getBookings, updateBookingStatus, deleteProperty } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [properties, setProperties] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [activeTab, setActiveTab] = useState('properties');

    useEffect(() => {
        // Redirect if not admin
        if (user && user.role !== 'admin') {
            navigate('/dashboard');
            return;
        }

        const fetchData = async () => {
            try {
                const propsRes = await getProperties();
                setProperties(propsRes.data);

                const booksRes = await getBookings();
                setBookings(booksRes.data);

                setLoading(false);
            } catch (err) {
                setError('Failed to fetch admin dashboard data.');
                setLoading(false);
            }
        };

        if (user && user.role === 'admin') {
            fetchData();
        }
    }, [user, navigate]);

    const handleDeleteProperty = async (id) => {
        if (window.confirm('Delete this property globally?')) {
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
            setBookings(bookings.map(b => b._id === id ? { ...b, status } : b));
        } catch (err) {
            alert('Failed to update status');
        }
    };

    if (loading) return <div className="text-center mt-5"><div className="spinner-border"></div></div>;

    return (
        <div className="container mt-4 mb-5">
            <h2 className="mb-4 text-primary">Admin Dashboard</h2>

            {error && <div className="alert alert-danger">{error}</div>}

            <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                    <button
                        className={`nav-link fw-bold ${activeTab === 'properties' ? 'active' : ''}`}
                        onClick={() => setActiveTab('properties')}
                    >
                        All Properties ({properties.length})
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link fw-bold ${activeTab === 'bookings' ? 'active' : ''}`}
                        onClick={() => setActiveTab('bookings')}
                    >
                        All Bookings ({bookings.length})
                    </button>
                </li>
            </ul>

            {activeTab === 'properties' && (
                <div className="table-responsive bg-white rounded-4 shadow-sm p-3">
                    <table className="table table-hover table-borderless">
                        <thead className="table-light">
                            <tr>
                                <th>Title</th>
                                <th>Owner Ref</th>
                                <th>Price</th>
                                <th>Location</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {properties.length > 0 ? (
                                properties.map((property) => (
                                    <tr key={property._id}>
                                        <td><Link to={`/property/${property._id}`}>{property.title}</Link></td>
                                        <td>{property.owner?.name || property.owner || 'Unknown'}</td>
                                        <td>${property.price}</td>
                                        <td>{property.location}</td>
                                        <td>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => handleDeleteProperty(property._id)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center">No properties found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'bookings' && (
                <div className="table-responsive bg-white rounded-4 shadow-sm p-3">
                    <table className="table table-hover table-borderless">
                        <thead className="table-light">
                            <tr>
                                <th>User</th>
                                <th>Property</th>
                                <th>Requested Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.length > 0 ? (
                                bookings.map((booking) => (
                                    <tr key={booking._id}>
                                        <td>{booking.user?.name || booking.user || 'Unknown'} (Email: {booking.user?.email})</td>
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
                                                        className="btn btn-success"
                                                        onClick={() => handleUpdateStatus(booking._id, 'approved')}
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        className="btn btn-danger"
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
                                    <td colSpan="5" className="text-center">No bookings found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
