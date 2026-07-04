function SummaryCard({ title, value, subtitle }) {
  return (
    <div className="summary-card">
      <div className="summary-card-header">
        <h3>{title}</h3>
      </div>

      <div className="summary-card-body">
        <p className="summary-card-value">{value}</p>
        {subtitle && <span className="summary-card-subtitle">{subtitle}</span>}
      </div>
    </div>
  );
}

export default SummaryCard;