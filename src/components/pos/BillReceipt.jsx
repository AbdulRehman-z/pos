import React from "react";

const BillReceipt = React.forwardRef(
	({ cart, customer, totals, invoiceId, paymentMethod, orderTime }, ref) => {
		// ✅ Use the server-confirmed timestamp passed from parent.
		// Fallback to now() only if not provided (defensive).
		const displayTime = orderTime
			? new Date(orderTime).toLocaleString("en-US", {
				year: "numeric", month: "2-digit", day: "2-digit",
				hour: "2-digit", minute: "2-digit", hour12: true,
				timeZone: "Asia/Karachi" // ✅ PKT
			})
			: new Date().toLocaleString("en-US", {
				year: "numeric", month: "2-digit", day: "2-digit",
				hour: "2-digit", minute: "2-digit", hour12: true,
				timeZone: "Asia/Karachi"
			});
		return (
			<div
				ref={ref}
				style={{
					width: "80mm",
					margin: "0 auto",
					fontFamily: "'Courier New', Courier, monospace",
					fontSize: "12px",
					padding: "4mm",
					backgroundColor: "white",
					color: "black",
					lineHeight: "1.2",
				}}
			>
				<style>
					{`
                    @media print {
                        @page {
                            size: 80mm auto;
                            margin: 0;
                        }
                        body {
                            margin: 0;
                            padding: 0;
                        }
                    }
                `}
				</style>

				{/* HEADER */}
				<div style={{ textAlign: "center", marginBottom: "8px" }}>
					<h1
						style={{
							margin: "0",
							fontSize: "20px",
							fontWeight: "bold",
							textTransform: "uppercase",
						}}
					>
						FryDate Cafe
					</h1>
					<p style={{ margin: "2px 0", fontSize: "11px", fontWeight: "550" }}>
						Opp PSO PUMP, Mall Road, Peshawar Cantt
					</p>
					<p style={{ margin: "2px 0", fontSize: "11px", fontWeight: "550" }}>
						TEL: +923189622272
					</p>
				</div>

				{/* DIVIDER */}
				<div style={{ borderTop: "1px dashed #000", margin: "6px 0" }}></div>

				{/* ORDER INFO */}
				<div
					style={{ marginBottom: "8px", fontSize: "11px", fontWeight: "550" }}
				>
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							marginBottom: "2px",
						}}
					>
						<span style={{ letterSpacing: "1px" }}>Bill No:</span>
						<span style={{ fontWeight: "bold" }}>{invoiceId || "---"}</span>
					</div>
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							marginBottom: "2px",
						}}
					>
						<span style={{ letterSpacing: "1px" }}>Order Time:</span>
						<span>{displayTime}</span>
					</div>
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							marginBottom: "2px",
						}}
					>
						<span style={{ letterSpacing: "1px" }}>CUSTOMER:</span>
						<span>{customer.name || "Walk-in"}</span>
					</div>
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							marginBottom: "2px",
						}}
					>
						<span style={{ letterSpacing: "1px" }}>TABLE No:</span>
						<span>{customer.table || "0"}</span>
					</div>
					<div style={{ display: "flex", justifyContent: "space-between" }}>
						<span style={{ letterSpacing: "1px" }}>PAYMENT Mode:</span>
						<span style={{ fontWeight: "bold" }}>
							{paymentMethod || "CASH"}
						</span>
					</div>
				</div>

				{/* DIVIDER */}
				<div style={{ borderTop: "1px dashed #000", margin: "6px 0" }}></div>

				{/* ITEMS TABLE */}
				<table
					style={{
						width: "100%",
						borderCollapse: "collapse",
						marginBottom: "8px",
						fontSize: "11px",
					}}
				>
					<thead>
						<tr style={{ borderBottom: "1px solid #000" }}>
							<th
								style={{
									textAlign: "left",
									padding: "4px 0",
									letterSpacing: "1px",
								}}
							>
								ITEM
							</th>
							<th
								style={{
									textAlign: "center",
									padding: "4px 0",
									letterSpacing: "1px",
								}}
							>
								QTY
							</th>
							<th
								style={{
									textAlign: "right",
									padding: "4px 0",
									letterSpacing: "1px",
								}}
							>
								TOTAL
							</th>
						</tr>
					</thead>
					<tbody>
						{cart.map((item, index) => (
							<tr key={index}>
								<td
									style={{
										padding: "4px 0",
										maxWidth: "120px",
										fontWeight: "550",
									}}
								>
									{item.name}
									<div
										style={{
											fontSize: "11px",
											fontWeight: "550",
											color: "#000000ff",
										}}
									>
										unit price: {item.price}
									</div>
								</td>
								<td
									style={{
										textAlign: "center",
										padding: "4px 0",
										verticalAlign: "top",
										fontWeight: "bold",
									}}
								>
									{item.qty}
								</td>
								<td
									style={{
										textAlign: "right",
										padding: "4px 0",
										verticalAlign: "top",
										fontWeight: "bold",
									}}
								>
									{item.price * item.qty}
								</td>
							</tr>
						))}
					</tbody>
				</table>

				{/* DIVIDER */}
				<div style={{ borderTop: "1px solid #000", margin: "6px 0" }}></div>

				{/* TOTALS */}
				<div style={{ marginBottom: "8px", fontWeight: "600" }}>
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							fontSize: "18px",
							fontWeight: "bold",
							margin: "4px 0",
						}}
					>
						<span style={{ letterSpacing: "1px" }}>NET TOTAL:</span>
						<span>PKR {totals.total}</span>
					</div>
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							fontSize: "12px",
							marginBottom: "2px",
						}}
					>
						<span style={{ letterSpacing: "1px" }}>RECEIVED:</span>
						<span>PKR {totals.received}</span>
					</div>
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							fontSize: "12px",
						}}
					>
						<span>CHANGE:</span>
						<span>
							PKR {totals.change >= 0 ? totals.change.toFixed(2) : "0.00"}
						</span>
					</div>
				</div>

				{/* DIVIDER */}
				<div style={{ borderTop: "1px dashed #000", margin: "6px 0" }}></div>

				{/* FOOTER */}
				<div
					style={{
						textAlign: "center",
						fontSize: "11px",
						marginTop: "8px",
						paddingBottom: "10mm",
					}}
				>
					<p style={{ margin: "2px 0", fontWeight: "bold" }}>
						Thank you for Dining With Us!
					</p>
					<p style={{ margin: "2px 0", fontWeight: "600" }}>
						PLEASE VISIT AGAIN
					</p>
					<div
						style={{
							marginTop: "10px",
							fontWeight: "600",
							fontSize: "9px",
							borderTop: "1px solid #2e2e2eff",
							paddingTop: "4px",
						}}
					>
						Software by codeclub.tech
					</div>
				</div>
			</div>
		);
	},
);

export default BillReceipt;
