const EmptyState = ({ icon = 'fa-inbox', message = 'No data found' }) => (
    <div className="empty-state">
        <i className={`fa-solid ${icon}`}></i>
        <p>{message}</p>
    </div>
);

export default EmptyState;
