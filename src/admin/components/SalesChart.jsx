function formatCurrency(value) {
    return `₦${Number(value || 0).toLocaleString()}`;
}

function SalesChart({ sales = [] }) {

    const maximumRevenue = Math.max(
        ...sales.map((day) => Number(day.revenue || 0)),
        1
    );

    return (

        <div className="sales-chart" aria-label="Sales revenue chart">

            {sales.length === 0 ? (

                <p>No sales data for this period.</p>

            ) : (

                <div className="sales-chart-bars">

                    {sales.map((day) => {

                        const revenue = Number(day.revenue || 0);
                        const height = Math.max(
                            (revenue / maximumRevenue) * 100,
                            revenue > 0 ? 4 : 0
                        );

                        return (

                            <div
                                className="sales-chart-column"
                                key={day.sale_date}
                                title={`${day.sale_date}: ${formatCurrency(revenue)}`}
                            >
                                <div className="sales-chart-value">
                                    {formatCurrency(revenue)}
                                </div>
                                <div
                                    className="sales-chart-bar"
                                    style={{ height: `${height}%` }}
                                />
                                <span>
                                    {day.sale_date.slice(5)}
                                </span>
                            </div>
                        );
                    })}

                </div>

            )}

        </div>
    );
}

export default SalesChart;
