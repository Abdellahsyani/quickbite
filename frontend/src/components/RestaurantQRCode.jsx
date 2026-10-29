import { QRCodeSVG } from "qrcode.react";

export default function RestaurantQRCode({ restaurantId }) {
  const menuURL = new URL(
    `/order/${restaurantId}`,
    window.location.origin,
  ).href;

  return (
    <QRCodeSVG
      value={menuURL}
      size={240}
      marginSize={4}
      level="M"
      title="Scan to open the restaurant menu"
      className="block h-auto max-w-full"
    />
  );
}
