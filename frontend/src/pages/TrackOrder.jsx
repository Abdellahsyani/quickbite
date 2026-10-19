import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import api from '../api';

export default function TrackOrder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('token');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const refresh = async () => {
      try {
        // Tracking credentials are independent of the staff login session.
        const response = await axios.get(`${api.defaults.baseURL}/orders/${id}/track`, {
          params: { token }, signal: controller.signal,
        });
        if (active) { setOrder(response.data); setError(''); }
      } catch (err) {
        if (active) setError(err.response?.data?.message || 'Unable to load order. Retrying…');
      }
    };
    refresh();
    const timer = setInterval(refresh, 5000);
    return () => { active = false; controller.abort(); clearInterval(timer); };
  }, [id, token]);

  return <main className="max-w-lg mx-auto p-8 space-y-5">
    <h1 className="text-2xl font-bold">Order #{id}</h1>
    {error && <p role="alert" className="text-red-600">{error}</p>}
    {!order && !error && <p>Loading order…</p>}
    {order && <>
      <p className="text-xl font-semibold">{order.status === 'ARCHIVED' ? 'COMPLETED' : order.status}</p>
      <p>{order.table}</p>
      <ul>{order.items.map((item, index) => <li key={index}>{item.quantity} × {item.menuItem.name}</li>)}</ul>
      <p>Total: ${Number(order.totalPrice).toFixed(2)}</p>
      <button onClick={() => navigate(-1)} className="text-blue-600">Back</button>
    </>}
  </main>;
}
