import { Link } from "react-router-dom";
import { ArrowLeft, UtensilsCrossed } from "lucide-react";
import api from "../api";
import RestaurantQRCode from "../components/RestaurantQRCode";
import { useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";

export default function RestaurantQRPage() {
  const [restaurant, setRestaurant] = useState(null);
  const [error, setError] = useState("");
  const cardRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    api.get("/auth/restaurant", { signal: controller.signal })
      .then(({ data }) => {
        if (!controller.signal.aborted) {
          setRestaurant(data);
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          setError(
            err.response?.data?.message ||
            "Unable to load your restaurant."
          );
        }
      });

    return () => controller.abort();
  }, []);

  const downloadCard = async () => {
    if (!cardRef.current || !restaurant || downloading) return;

    setDownloading(true);
    setDownloadError("");

    try {
      // Wait for fonts before capturing the card.
      await document.fonts.ready;

      const imageURL = await toPng(cardRef.current, {
        pixelRatio: 3,
        backgroundColor: "#ffffff",
      });

      const link = document.createElement("a");
      link.href = imageURL;
      link.download = `restaurant-${restaurant.id}-menu-qr.png`;

      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("QR download failed:", err);
      setDownloadError("Unable to download the QR card. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-full bg-slate-50 px-4 py-6 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-lg">
        <Link
          to="/AdminDashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-blue-600"
        >
          <ArrowLeft size={18} />
          Back to dashboard
        </Link>

        <div className="mb-8 mt-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Your menu QR code
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Give customers an easy way to discover your menu.
          </p>
        </div>

        {error ? (
          <p
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"
          >
            {error}
          </p>
        ) : !restaurant ? (
          <p role="status" className="py-12 text-center text-slate-500">
            Loading your restaurant…
          </p>
        ) : (
          <section ref={cardRef} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="h-2 bg-blue-600" />

            <div className="px-6 py-10 text-center sm:px-10">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <UtensilsCrossed size={26} aria-hidden="true" />
              </div>

              <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
                Welcome to
              </p>

              <h2 className="mt-3 break-words text-3xl font-bold tracking-tight text-slate-900">
                {restaurant.name}
              </h2>

              <div className="mx-auto my-8 w-fit max-w-full rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
                <RestaurantQRCode restaurantId={restaurant.id} />
              </div>

              <h3 className="text-lg font-semibold text-slate-900">
                Scan to view our menu
              </h3>

              <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-500">
                Open your phone’s camera, scan the code, and choose
                something delicious.
              </p>
            </div>

            <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 text-center">
              <p className="text-xs font-medium text-slate-400">
                Powered by QuickBite
              </p>
            </div>
          </section>
        )}
        {restaurant && (
          <div className="mt-6">
            <button
              type="button"
              onClick={downloadCard}
              disabled={downloading}
              className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60"
            >
              {downloading ? "Preparing image…" : "Download QR card"}
            </button>

            {downloadError && (
              <p role="alert" className="mt-3 text-sm text-red-600">
                {downloadError}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
