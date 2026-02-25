import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { colorSets } from '../api/client';

function getGradeId(g) {
  return typeof g === 'object' && g != null ? g._id : g;
}

export default function ColorSetDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addItem } = useCart();
  const [setData, setSetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedGradeByColor, setSelectedGradeByColor] = useState({});
  const [quantityByColor, setQuantityByColor] = useState({});
  const [addingColorId, setAddingColorId] = useState(null);
  const [addedColorIds, setAddedColorIds] = useState(new Set());

  useEffect(() => {
    if (!user) {
      setError('Log in to view color sets');
      setLoading(false);
      return;
    }
    colorSets
      .get(id)
      .then(({ data }) => {
        setSetData(data);
        const gradesByColor = {};
        const qtyByColor = {};
        (data.colors || []).forEach((c) => {
          const moq = c.product?.minimumOrderQuantity ?? 1;
          const grades = c.product?.grades ?? [];
          if (grades.length) {
            gradesByColor[c._id] = getGradeId(grades[0]);
            qtyByColor[c._id] = moq;
          }
        });
        setSelectedGradeByColor(gradesByColor);
        setQuantityByColor(qtyByColor);
      })
      .catch(() => setError('Color set not found'))
      .finally(() => setLoading(false));
  }, [id, user]);

  const handleAddToCart = async (color) => {
    const product = color.product;
    if (!product || !product.grades?.length) return;
    const gradeId = selectedGradeByColor[color._id] ?? getGradeId(product.grades[0]);
    const grade = product.grades.find((g) => getGradeId(g) === gradeId);
    if (!grade) return;
    const moq = product.minimumOrderQuantity ?? 1;
    const qty = Math.max(moq, Number(quantityByColor[color._id]) || moq);
    setAddingColorId(color._id);
    try {
      await addItem({
        productId: product._id,
        productName: product.name ?? '',
        productImage: product.image ?? null,
        grade: { id: gradeId, name: grade.name, price: grade.price },
        colors: [{ id: color._id, name: color.name ?? '', hexCode: color.hexCode ?? '#888' }],
        quantity: qty,
        unitPrice: Number(grade.price) ?? 0,
        totalPrice: (Number(grade.price) ?? 0) * qty,
        minimumOrderQuantity: product.minimumOrderQuantity ?? 1,
      });
      setAddedColorIds((prev) => new Set(prev).add(color._id));
    } catch {
      setError('Failed to add to cart');
    } finally {
      setAddingColorId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-slate-600">Loading…</div>
    );
  }

  if (error || !setData) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center text-red-600">
        {error || 'Not found'}
        <Link to="/my-color-sets" className="block mt-4 text-brand-600 hover:underline font-medium">
          Back to My Color Sets
        </Link>
      </div>
    );
  }

  const canEdit = user?.role === 'admin' || (setData.createdBy?._id === user?._id && !setData.isAdminSet);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link to="/my-color-sets" className="text-slate-600 hover:text-slate-900 text-sm mb-6 inline-block">
        ← My Color Sets
      </Link>
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{setData.name}</h1>
          <p className="text-slate-600 text-sm mt-1">
            {setData.isAdminSet ? 'Admin color set' : `By ${setData.createdBy?.name}`}
            {setData.product?.name && ` · ${setData.product.name}`}
          </p>
        </div>
        {canEdit && (
          <Link
            to={`/color-set/${id}/edit`}
            className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 text-sm font-medium"
          >
            Edit
          </Link>
        )}
      </div>

      <div className="space-y-4">
        {setData.colors?.length ? (
          setData.colors.map((c) => {
            const product = c.product;
            const grades = product?.grades ?? [];
            const moq = product?.minimumOrderQuantity ?? 1;
            const selectedGradeId = selectedGradeByColor[c._id];
            const grade = grades.find((g) => getGradeId(g) === selectedGradeId);
            const qty = Math.max(moq, Number(quantityByColor[c._id]) || moq);
            const canAdd = product && grades.length > 0;
            const isAdding = addingColorId === c._id;
            const wasAdded = addedColorIds.has(c._id);

            return (
              <div
                key={c._id}
                className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-white border border-slate-200 shadow-sm"
              >
                <div className="flex items-center gap-3 shrink-0">
                  <div
                    className="w-14 h-14 rounded-full border-2 border-slate-300 shrink-0"
                    style={{ backgroundColor: c.hexCode || '#666' }}
                  />
                  <div>
                    <span className="text-slate-800 font-medium block">{c.name}</span>
                    <span className="text-slate-500 text-xs">{c.hexCode}</span>
                    {product && (
                      <Link
                        to={`/product/${product._id}`}
                        className="text-sm text-brand-600 hover:underline mt-0.5 inline-block"
                      >
                        {product.name}
                      </Link>
                    )}
                  </div>
                </div>

                {canAdd && (
                  <div className="flex flex-wrap items-center gap-3 flex-1">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-medium text-slate-500">Grade</label>
                      <select
                        value={selectedGradeId || ''}
                        onChange={(e) =>
                          setSelectedGradeByColor((prev) => ({ ...prev, [c._id]: e.target.value }))
                        }
                        className="px-3 py-2 rounded-lg border border-slate-300 text-slate-800 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                      >
                        {grades.map((g) => (
                          <option key={getGradeId(g)} value={getGradeId(g)}>
                            {g.name} — ₹{Number(g.price)}/kg
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-medium text-slate-500">Qty (kg)</label>
                      <input
                        type="number"
                        min={moq}
                        value={quantityByColor[c._id] ?? moq}
                        onChange={(e) => {
                          const v = parseInt(e.target.value, 10);
                          if (!isNaN(v) && v >= moq) {
                            setQuantityByColor((prev) => ({ ...prev, [c._id]: v }));
                          }
                        }}
                        className="w-20 px-3 py-2 rounded-lg border border-slate-300 text-slate-800 text-sm focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddToCart(c)}
                      disabled={isAdding}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        wasAdded
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-brand-500 text-white hover:bg-brand-600'
                      } disabled:opacity-50`}
                    >
                      {isAdding ? 'Adding…' : wasAdded ? '✓ In cart' : 'Add to cart'}
                    </button>
                  </div>
                )}

                {!canAdd && product && (
                  <p className="text-slate-500 text-sm">No grades available for this product.</p>
                )}
                {!product && <p className="text-slate-500 text-sm">Product not available.</p>}
              </div>
            );
          })
        ) : (
          <p className="text-slate-600">No colors in this set</p>
        )}
      </div>
    </div>
  );
}
