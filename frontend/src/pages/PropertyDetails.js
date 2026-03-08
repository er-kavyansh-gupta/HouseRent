import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPropertyById, createBooking } from '../services/api';
import { AuthContext } from '../context/AuthContext';

const PropertyDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [bookingDate, setBookingDate] = useState('');
    const [bookingLoading, setBookingLoading] = useState(false);
    const [bookingMsg, setBookingMsg] = useState('');

    // Payment Modal State
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [paymentProcessing, setPaymentProcessing] = useState(false);

    useEffect(() => {
        const fetchProperty = async () => {
            try {
                const { data } = await getPropertyById(id);
                setProperty(data);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch property details.');
                setLoading(false);
            }
        };

        fetchProperty();
    }, [id]);

    const handleBookingClick = (e) => {
        e.preventDefault();
        if (!user) {
            return navigate('/login');
        }
        if (!bookingDate) {
            return setError('Please select a booking date first.');
        }
        setError('');
        setShowPaymentModal(true);
    };

    const processPaymentAndBook = async (e) => {
        e.preventDefault();
        setPaymentProcessing(true);
        setError('');
        setBookingMsg('');

        // Simulate payment processing delay
        setTimeout(async () => {
            try {
                await createBooking({ propertyId: id, bookingDate });
                setBookingMsg('Payment successful! Booking requested successfully.');
                setBookingDate('');
                setShowPaymentModal(false);
                // Clear payment fields
                setCardNumber('');
                setExpiry('');
                setCvv('');
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to book property.');
            } finally {
                setPaymentProcessing(false);
            }
        }, 1500);
    };

    if (loading) return <div className="text-center mt-5"><div className="spinner-border"></div></div>;
    if (error && !property) return <div className="alert alert-danger mt-5">{error}</div>;

    return (
        <div className="container mt-4 mb-5">
            {property && (
                <div className="row">
                    <div className="col-lg-8">
                        <div className="card shadow-sm border-0 rounded-4 overflow-hidden mb-4">
                            <img
                                src={property.image ? `http://localhost:5000/${property.image}` : "https://via.placeholder.com/800x400?text=Property+Image"}
                                className="card-img-top"
                                alt={property.title}
                                style={{ width: '100%', height: '400px', objectFit: 'cover' }}
                            />
                            <div className="card-body p-4">
                                <h2 className="fw-bold mb-2">{property.title}</h2>
                                <p className="text-muted fs-5 mb-4"><i className="bi bi-geo-alt-fill text-primary"></i> {property.location}</p>

                                <div className="d-flex gap-3 mb-4">
                                    <span className="badge bg-secondary fs-6 px-3 py-2 rounded-pill">{property.type}</span>
                                    <span className="badge bg-primary fs-6 px-3 py-2 rounded-pill shadow-sm">${property.price} / month</span>
                                </div>

                                <h4>Description</h4>
                                <p className="lead" style={{ whiteSpace: 'pre-line' }}>{property.description}</p>

                                <hr className="my-4 text-muted" />
                                <h5 className="fw-bold">Owner Information</h5>
                                <p className="mb-1"><i className="bi bi-person-circle me-2 text-muted"></i> {property.owner?.name || 'Unknown'}</p>
                                <p className="mb-0"><i className="bi bi-envelope-fill me-2 text-muted"></i> {property.owner?.email || 'Unknown'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-4">
                        <div className="card shadow-md border-0 rounded-4 position-sticky" style={{ top: '100px' }}>
                            <div className="card-body p-4">
                                <h4 className="card-title text-center fw-bold mb-4">Book a Visit</h4>

                                {bookingMsg && <div className="alert alert-success">{bookingMsg}</div>}
                                {error && <div className="alert alert-danger">{error}</div>}

                                {user ? (
                                    <form onSubmit={handleBookingClick}>
                                        <div className="mb-4">
                                            <label className="form-label fw-bold">Select Move-in Date</label>
                                            <input
                                                type="date"
                                                className="form-control form-control-lg border-primary border-opacity-50 shadow-sm"
                                                value={bookingDate}
                                                onChange={(e) => setBookingDate(e.target.value)}
                                                required
                                                min={new Date().toISOString().split('T')[0]}
                                                style={{ borderRadius: '12px' }}
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="btn btn-primary btn-lg w-100 fw-bold shadow-sm"
                                            style={{ borderRadius: '12px', transition: 'all 0.3s ease' }}
                                        >
                                            {`Book for $${property.price}`}
                                        </button>
                                    </form>
                                ) : (
                                    <div className="text-center">
                                        <p>Please login to book a visit.</p>
                                        <Link to="/login" className="btn btn-outline-primary w-100">Login Here</Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content rounded-4 border-0 shadow">
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold">Complete Payment</h5>
                                <button type="button" className="btn-close" onClick={() => setShowPaymentModal(false)} disabled={paymentProcessing}></button>
                            </div>
                            <div className="modal-body p-4">
                                <div className="mb-4 text-center">
                                    <h4 className="fw-bold text-primary mb-1">${property.price}</h4>
                                    <p className="text-muted mb-0">Total amount for {property.title}</p>
                                </div>
                                <form onSubmit={processPaymentAndBook}>
                                    <div className="mb-3">
                                        <label className="form-label text-muted small text-uppercase fw-bold">Card Number (Fake)</label>
                                        <input
                                            type="text"
                                            className="form-control form-control-lg"
                                            placeholder="XXXX XXXX XXXX XXXX"
                                            value={cardNumber}
                                            onChange={(e) => setCardNumber(e.target.value)}
                                            required
                                            maxLength="19"
                                        />
                                    </div>
                                    <div className="row mb-4">
                                        <div className="col-6">
                                            <label className="form-label text-muted small text-uppercase fw-bold">Expiry Date</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-lg"
                                                placeholder="MM/YY"
                                                value={expiry}
                                                onChange={(e) => setExpiry(e.target.value)}
                                                required
                                                maxLength="5"
                                            />
                                        </div>
                                        <div className="col-6">
                                            <label className="form-label text-muted small text-uppercase fw-bold">CVV</label>
                                            <input
                                                type="password"
                                                className="form-control form-control-lg"
                                                placeholder="***"
                                                value={cvv}
                                                onChange={(e) => setCvv(e.target.value)}
                                                required
                                                maxLength="4"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        className="btn btn-primary btn-lg w-100 fw-bold"
                                        disabled={paymentProcessing}
                                    >
                                        {paymentProcessing ? (
                                            <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Processing...</>
                                        ) : (
                                            `Pay $${property.price} Now`
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PropertyDetails;
