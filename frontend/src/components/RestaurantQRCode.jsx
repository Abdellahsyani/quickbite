import { QRCodeSVG } from "qrcode.react";

export default function RestaurantQRCode() {
  const menuUrl = new URL(
    "/order/1",
    window.location.origin,
  ).href;

  return (
    < section className="rounded-xl bg-white p-6" >
      <h2 className="mb-4 text-xl font-bold">
        Restaurant QR code
      </h2>
      <QRCodeSVG
        value={menuUrl}
        size={220}
        marginSize={4}
      />
      <p className="mt-4 break-all text-sm text-gray-600">
        {menuUrl}
      </p>
    </section >
  )
}
