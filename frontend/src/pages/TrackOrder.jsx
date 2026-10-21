import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
  ShoppingBag,
  ChefHat,
  Check,
  CheckCircle2,
  Clock3,
  AlertCircle,
  Loader2,
  UtensilsCrossed,
} from 'lucide-react';
import api from '../api';

const steps = [
  {
    status: 'PENDING',
    title: 'Order received',
    description: 'Your order has reached the kitchen.',
    icon: ShoppingBag,
  },
  {
    status: 'PREPARING',
    title: 'Being prepared',
    description: 'The kitchen is preparing your food.',
    icon: ChefHat,
  },
  {
    status: 'COMPLETED',
    title: 'Order completed',
    description: 'The kitchen has marked your order complete.',
    icon: CheckCircle2,
  },
];

export default function TrackOrder() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const token = params.get('token');

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    let timer;
    const controller = new AbortController();

    setOrder(null);
    setError('');
    setLoading(true);
    setLastUpdated(null);

    if (!token || !/^[1-9]\d*$/.test(id ?? '')) {
      setError('This tracking link is invalid or incomplete.');
      setLoading(false);
      return;
    }

    const refresh = async () => {
      let keepPolling = true;

      try {
        // Use axios directly to avoid the staff-login interceptor.
        const { data } = await axios.get(
          `${api.defaults.baseURL}/orders/${id}/track`,
          {
            params: { token },
            signal: controller.signal,
            timeout: 10000,
          },
        );

        if (!active) return;

        setOrder(data);
        setError('');
        setLastUpdated(new Date());

        keepPolling = ![
          'COMPLETED',
          'ARCHIVED',
          'CANCELLED',
        ].includes(data.status);
      } catch (err) {
        if (!active || axios.isCancel(err)) return;

        const status = err.response?.status;
        const permanentError = [400, 401, 403, 404].includes(status);

        setError(
          permanentError
            ? err.response?.data?.message ||
            'This order cannot be accessed with this link.'
            : 'Connection interrupted. Retrying automatically…',
        );

        keepPolling = !permanentError;
      } finally {
        if (active) {
          setLoading(false);

          // Schedule after completion to avoid overlapping requests.
          if (keepPolling) {
            timer = setTimeout(refresh, 5000);
          }
        }
      }
    };

    refresh();

    return () => {
      active = false;
      controller.abort();
      clearTimeout(timer);
    };
  }, [id, token, retry]);

  const status =
    order?.status === 'ARCHIVED' ? 'COMPLETED' : order?.status;

  const currentStep = steps.findIndex(step => step.status === status);
  const cancelled = status === 'CANCELLED';
  const completed = status === 'COMPLETED';

  const headline = cancelled
    ? 'Order cancelled'
    : steps[currentStep]?.title || 'Order update';

  const description = cancelled
    ? 'Please contact the restaurant if you need help.'
    : steps[currentStep]?.description ||
    'Check with the restaurant for more information.';

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-xl">
        {/* Brand */}
        <header className="mb-8 flex items-center justify-center gap-2">
          <span className="rounded-xl bg-blue-600 p-2 text-white">
            <UtensilsCrossed size={20} />
          </span>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            QuickBite
          </span>
        </header>

        {/* Loading */}
        {loading && (
          <div
            role="status"
            className="rounded-3xl border border-slate-200 bg-white p-12 text-center"
          >
            <Loader2
              size={32}
              className="mx-auto mb-4 animate-spin text-blue-600"
            />
            <h1 className="text-lg font-semibold text-slate-900">
              Finding your order
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Checking the latest update from the kitchen…
            </p>
          </div>
        )}

        {/* Errors remain visible even when an older order is available */}
        {error && (
          <div
            role="alert"
            className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-5"
          >
            <div className="flex items-start gap-3">
              <AlertCircle
                size={20}
                className="mt-0.5 shrink-0 text-amber-700"
              />
              <div>
                <p className="text-sm font-medium text-amber-900">
                  {error}
                </p>
                {order && (
                  <p className="mt-1 text-xs text-amber-800">
                    The information below is the last successful update.
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => setRetry(value => value + 1)}
                  className="mt-3 text-sm font-semibold text-amber-900 underline underline-offset-4"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {order && (
          <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            {/* Current status */}
            <section className="border-b border-slate-100 px-6 py-8 text-center sm:px-8">
              <div
                className={`mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full ${cancelled
                    ? 'bg-red-50 text-red-600'
                    : completed
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-blue-50 text-blue-600'
                  }`}
              >
                {cancelled ? (
                  <AlertCircle size={36} />
                ) : completed ? (
                  <CheckCircle2 size={36} />
                ) : (
                  <ChefHat size={36} />
                )}
              </div>

              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
                Order #{order.id}
              </p>

              <div role="status" aria-live="polite">
                <h1 className="text-2xl font-bold text-slate-900">
                  {headline}
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  {description}
                </p>
              </div>

              <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
                <UtensilsCrossed size={15} />
                {order.table}
              </span>
            </section>

            {/* Progress */}
            {!cancelled && (
              <section
                aria-label="Order progress"
                className="border-b border-slate-100 px-6 py-7 sm:px-8"
              >
                <ol>
                  {steps.map((step, index) => {
                    const reached = currentStep >= index;
                    const isCurrent = currentStep === index;
                    const Icon = step.icon;

                    return (
                      <li
                        key={step.status}
                        aria-current={isCurrent ? 'step' : undefined}
                        className="relative flex gap-4 pb-7 last:pb-0"
                      >
                        {index < steps.length - 1 && (
                          <span
                            aria-hidden="true"
                            className={`absolute left-[19px] top-11 h-[calc(100%-2.75rem)] w-0.5 ${currentStep > index
                                ? 'bg-blue-600'
                                : 'bg-slate-200'
                              }`}
                          />
                        )}

                        <span
                          className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${reached
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-400'
                            }`}
                        >
                          {currentStep > index ? (
                            <Check size={19} />
                          ) : (
                            <Icon size={19} />
                          )}
                        </span>

                        <div className="pt-0.5">
                          <p
                            className={`text-sm font-semibold ${reached ? 'text-slate-900' : 'text-slate-400'
                              }`}
                          >
                            {step.title}
                          </p>
                          <p className="mt-1 text-xs leading-relaxed text-slate-500">
                            {step.description}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </section>
            )}

            {/* Receipt */}
            <section className="px-6 py-7 sm:px-8">
              <h2 className="mb-5 text-sm font-bold text-slate-900">
                Your order
              </h2>

              <ul className="space-y-4">
                {order.items.map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <span className="flex h-8 min-w-8 items-center justify-center rounded-lg bg-slate-100 px-2 text-xs font-bold text-slate-700">
                      {item.quantity}×
                    </span>
                    <span className="text-sm text-slate-700">
                      {item.menuItem?.name || 'Menu item'}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex items-center justify-between border-t border-dashed border-slate-200 pt-5">
                <span className="font-semibold text-slate-900">
                  Order total
                </span>
                <span className="text-xl font-bold text-slate-900">
                  ${Number(order.totalPrice).toFixed(2)}
                </span>
              </div>
            </section>
          </article>
        )}

        {/* Footer */}
        {lastUpdated && (
          <p className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-500">
            <Clock3 size={14} />
            Updated at {lastUpdated.toLocaleTimeString()}
          </p>
        )}

        <p className="mt-4 text-center text-xs leading-relaxed text-slate-400">
          Keep this tracking link to check your order.
          <br />
          Need help? Ask the restaurant staff.
        </p>
      </div>
    </main>
  );
}
