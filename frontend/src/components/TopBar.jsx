export default function TopBar({ title, children }) {
    return (
        <div className="topbar">
            <h2>{title}</h2>
            {children && <div className="topbar-actions">{children}</div>}
        </div>
    );
}
