import { useState, useEffect } from "react";
import TopBar from "../components/TopBar";
import { LoadingSpinner, ErrorState } from "../components/UIStates";
import { getDashboardSummary } from "../api";

export default function Dashboard() {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchSummary = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getDashboardSummary();
            setSummary(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSummary();
    }, []);

    const today = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <>
            <TopBar title="Dashboard" />
            <div className="page-container">
                <p style={{ color: "var(--text-secondary)", marginBottom: 28, fontSize: 14 }}>
                    📅 {today}
                </p>

                {loading && <LoadingSpinner text="Loading dashboard..." />}
                {error && <ErrorState message={error} onRetry={fetchSummary} />}

                {!loading && !error && summary && (
                    <>
                        <div className="summary-grid">
                            <div className="summary-card accent">
                                <div className="summary-card-icon">👥</div>
                                <div className="summary-card-value">{summary.total_employees}</div>
                                <div className="summary-card-label">Total Employees</div>
                            </div>

                            <div className="summary-card success">
                                <div className="summary-card-icon">✅</div>
                                <div className="summary-card-value">{summary.present_today}</div>
                                <div className="summary-card-label">Present Today</div>
                            </div>

                            <div className="summary-card danger">
                                <div className="summary-card-icon">❌</div>
                                <div className="summary-card-value">{summary.absent_today}</div>
                                <div className="summary-card-label">Absent Today</div>
                            </div>

                            <div className="summary-card info">
                                <div className="summary-card-icon">📈</div>
                                <div className="summary-card-value">{summary.attendance_rate}%</div>
                                <div className="summary-card-label">Attendance Rate</div>
                            </div>
                        </div>

                        <div className="card" style={{ marginTop: 8 }}>
                            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Quick Overview</h3>
                            <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.8 }}>
                                Welcome to <strong style={{ color: "var(--text-primary)" }}>HRMS Lite</strong>.
                                Use the sidebar to navigate between Employee Management and Attendance Tracking.
                                {summary.total_employees === 0 && (
                                    <span> Get started by adding your first employee from the <strong style={{ color: "var(--accent-hover)" }}>Employees</strong> page.</span>
                                )}
                                {summary.total_employees > 0 && summary.present_today + summary.absent_today === 0 && (
                                    <span> No attendance has been recorded for today yet. Head to the <strong style={{ color: "var(--accent-hover)" }}>Attendance</strong> page to mark attendance.</span>
                                )}
                            </p>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
